import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, and, lte, lt } from "drizzle-orm";
import { publishPost } from "@/services/publisher";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find posts that are scheduled and due
  const duePosts = await db.query.posts.findMany({
    where: and(
      eq(posts.status, "scheduled"),
      lte(posts.scheduledFor, new Date()),
      lt(posts.retryCount, 3)
    ),
  });

  const results: { postId: string; success: boolean; errors?: string[] }[] = [];

  for (const post of duePosts) {
    try {
      const result = await publishPost(post.id);
      results.push({
        postId: post.id,
        success: result.allSucceeded,
        errors: result.errors.length > 0 ? result.errors : undefined,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`Cron publish failed for post ${post.id}:`, errorMsg);

      // Increment retry count
      await db
        .update(posts)
        .set({
          retryCount: post.retryCount + 1,
          lastError: errorMsg,
          status: post.retryCount + 1 >= 3 ? "failed" : "scheduled",
          updatedAt: new Date(),
        })
        .where(eq(posts.id, post.id));

      results.push({ postId: post.id, success: false, errors: [errorMsg] });
    }
  }

  return NextResponse.json({
    processed: duePosts.length,
    results,
  });
}
