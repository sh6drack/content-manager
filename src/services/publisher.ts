import { db } from "@/db";
import { posts, postPlatforms, platformConnections, media } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getValidToken } from "./token-refresh";
import { getAdapter } from "./platforms";
import type { Platform } from "@/lib/constants";

export async function publishPost(postId: string) {
  // Get the post with its target platforms and media
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });

  if (!post) throw new Error(`Post ${postId} not found`);

  const targets = await db.query.postPlatforms.findMany({
    where: eq(postPlatforms.postId, postId),
  });

  if (targets.length === 0) throw new Error(`Post ${postId} has no target platforms`);

  const postMedia = await db.query.media.findMany({
    where: eq(media.postId, postId),
  });

  // Set overall status to publishing
  await db
    .update(posts)
    .set({ status: "publishing", updatedAt: new Date() })
    .where(eq(posts.id, postId));

  let allSucceeded = true;
  let anySucceeded = false;
  const errors: string[] = [];

  for (const target of targets) {
    try {
      // Set per-platform status to publishing
      await db
        .update(postPlatforms)
        .set({ status: "publishing" })
        .where(eq(postPlatforms.id, target.id));

      // Find the platform connection
      const connection = await db.query.platformConnections.findFirst({
        where: and(
          eq(platformConnections.userId, post.userId),
          eq(platformConnections.platform, target.platform)
        ),
      });

      if (!connection) {
        throw new Error(`No ${target.platform} connection found`);
      }

      // Get a valid (non-expired) access token
      const accessToken = await getValidToken(connection.id);

      // Get the adapter for this platform
      const adapter = getAdapter(target.platform as Platform);

      // Upload media first if adapter supports it and we have media
      const mediaIds: string[] = [];
      const mediaUrls: string[] = [];

      for (const m of postMedia) {
        if (adapter.uploadMedia) {
          const result = await adapter.uploadMedia({
            accessToken,
            url: m.url,
            mimeType: m.mimeType || "image/jpeg",
            platformAccountId: connection.platformAccountId,
          });
          mediaIds.push(result.mediaId);
        } else {
          mediaUrls.push(m.url);
        }
      }

      // Publish the post
      const result = await adapter.publish({
        content: post.content,
        accessToken,
        mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        platformAccountId: connection.platformAccountId,
      });

      // Update per-platform status to published
      await db
        .update(postPlatforms)
        .set({
          status: "published",
          nativePostId: result.nativePostId,
          nativePostUrl: result.nativePostUrl,
          publishedAt: new Date(),
        })
        .where(eq(postPlatforms.id, target.id));

      // Link this connection to the post_platform
      await db
        .update(postPlatforms)
        .set({ platformConnectionId: connection.id })
        .where(eq(postPlatforms.id, target.id));

      anySucceeded = true;
    } catch (err) {
      allSucceeded = false;
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push(`${target.platform}: ${errorMsg}`);
      console.error(`Failed to publish to ${target.platform}:`, err);

      await db
        .update(postPlatforms)
        .set({ status: "failed", error: errorMsg })
        .where(eq(postPlatforms.id, target.id));
    }
  }

  // Set overall post status based on results
  const overallStatus = allSucceeded
    ? "published"
    : anySucceeded
      ? "published" // Partial success — at least one platform worked
      : "failed";

  await db
    .update(posts)
    .set({
      status: overallStatus,
      publishedAt: anySucceeded ? new Date() : undefined,
      lastError: errors.length > 0 ? errors.join("; ") : null,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));

  return { allSucceeded, anySucceeded, errors };
}
