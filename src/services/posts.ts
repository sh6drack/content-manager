import { db } from "@/db";
import { posts, postPlatforms, media } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import type { CreatePostInput, UpdatePostInput } from "@/lib/validations";
import type { Platform } from "@/lib/constants";

export async function createPost(userId: string, input: CreatePostInput) {
  const status = input.scheduledFor ? "scheduled" : "draft";

  // Create the post
  const [post] = await db
    .insert(posts)
    .values({
      userId,
      title: input.title,
      content: input.content,
      status,
      scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
    })
    .returning();

  // Create post_platforms junction rows
  if (input.platforms.length > 0) {
    await db.insert(postPlatforms).values(
      input.platforms.map((platform) => ({
        postId: post.id,
        platform: platform as Platform,
      }))
    );
  }

  // Link media if provided
  if (input.mediaIds && input.mediaIds.length > 0) {
    for (const mediaId of input.mediaIds) {
      await db
        .update(media)
        .set({ postId: post.id })
        .where(and(eq(media.id, mediaId), eq(media.userId, userId)));
    }
  }

  return getPostById(post.id, userId);
}

export async function getPostById(postId: string, userId: string) {
  const post = await db.query.posts.findFirst({
    where: and(eq(posts.id, postId), eq(posts.userId, userId)),
  });

  if (!post) return null;

  const platforms = await db.query.postPlatforms.findMany({
    where: eq(postPlatforms.postId, postId),
  });

  const postMedia = await db.query.media.findMany({
    where: eq(media.postId, postId),
  });

  return { ...post, platforms, media: postMedia };
}

export async function listPosts(
  userId: string,
  filters?: {
    year?: number;
    month?: number;
    platform?: Platform;
    status?: string;
  }
) {
  const conditions = [eq(posts.userId, userId)];

  if (filters?.year !== undefined && filters?.month !== undefined) {
    const startDate = new Date(filters.year, filters.month, 1);
    const endDate = new Date(filters.year, filters.month + 1, 0, 23, 59, 59);
    conditions.push(
      gte(posts.createdAt, startDate),
      lte(posts.createdAt, endDate)
    );
  }

  if (filters?.status) {
    conditions.push(eq(posts.status, filters.status as typeof posts.status.enumValues[number]));
  }

  const allPosts = await db.query.posts.findMany({
    where: and(...conditions),
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  });

  // Fetch platforms for each post
  const postIds = allPosts.map((p) => p.id);
  const allPlatforms =
    postIds.length > 0
      ? await db.query.postPlatforms.findMany({
          where: sql`${postPlatforms.postId} IN (${sql.join(
            postIds.map((id) => sql`${id}`),
            sql`, `
          )})`,
        })
      : [];

  // Filter by platform if specified
  const platformMap = new Map<string, typeof allPlatforms>();
  for (const pp of allPlatforms) {
    const existing = platformMap.get(pp.postId) || [];
    existing.push(pp);
    platformMap.set(pp.postId, existing);
  }

  let result = allPosts.map((post) => ({
    ...post,
    platforms: platformMap.get(post.id) || [],
  }));

  if (filters?.platform) {
    result = result.filter((post) =>
      post.platforms.some((pp) => pp.platform === filters.platform)
    );
  }

  return result;
}

export async function updatePost(
  postId: string,
  userId: string,
  input: UpdatePostInput
) {
  const existing = await db.query.posts.findFirst({
    where: and(eq(posts.id, postId), eq(posts.userId, userId)),
  });

  if (!existing) return null;

  const [updated] = await db
    .update(posts)
    .set({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.scheduledFor !== undefined && {
        scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
      }),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning();

  // Update platforms if provided
  if (input.platforms) {
    await db.delete(postPlatforms).where(eq(postPlatforms.postId, postId));
    if (input.platforms.length > 0) {
      await db.insert(postPlatforms).values(
        input.platforms.map((platform) => ({
          postId,
          platform: platform as Platform,
        }))
      );
    }
  }

  return getPostById(updated.id, userId);
}

export async function deletePost(postId: string, userId: string) {
  const existing = await db.query.posts.findFirst({
    where: and(eq(posts.id, postId), eq(posts.userId, userId)),
  });

  if (!existing) return false;

  await db.delete(posts).where(eq(posts.id, postId));
  return true;
}

export async function getPostsByMonth(
  userId: string,
  year: number,
  month: number
) {
  // Get posts that are scheduled/published in this month, OR created in this month
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const allPosts = await db.query.posts.findMany({
    where: and(
      eq(posts.userId, userId),
      sql`(
        (${posts.scheduledFor} >= ${startDate} AND ${posts.scheduledFor} <= ${endDate})
        OR (${posts.scheduledFor} IS NULL AND ${posts.createdAt} >= ${startDate} AND ${posts.createdAt} <= ${endDate})
      )`
    ),
    orderBy: (posts, { asc }) => [asc(posts.scheduledFor), asc(posts.createdAt)],
  });

  const postIds = allPosts.map((p) => p.id);
  const allPlatforms =
    postIds.length > 0
      ? await db.query.postPlatforms.findMany({
          where: sql`${postPlatforms.postId} IN (${sql.join(
            postIds.map((id) => sql`${id}`),
            sql`, `
          )})`,
        })
      : [];

  const platformMap = new Map<string, typeof allPlatforms>();
  for (const pp of allPlatforms) {
    const existing = platformMap.get(pp.postId) || [];
    existing.push(pp);
    platformMap.set(pp.postId, existing);
  }

  return allPosts.map((post) => ({
    ...post,
    platforms: platformMap.get(post.id) || [],
  }));
}

export async function getPostStats(userId: string) {
  const result = await db
    .select({
      status: posts.status,
      count: sql<number>`count(*)::int`,
    })
    .from(posts)
    .where(eq(posts.userId, userId))
    .groupBy(posts.status);

  const stats: Record<string, number> = {};
  for (const row of result) {
    stats[row.status] = row.count;
  }

  return {
    draft: stats.draft || 0,
    scheduled: stats.scheduled || 0,
    published: stats.published || 0,
    failed: stats.failed || 0,
    total:
      (stats.draft || 0) +
      (stats.scheduled || 0) +
      (stats.published || 0) +
      (stats.failed || 0),
  };
}
