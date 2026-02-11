import { db } from "@/db";
import {
  analyticsSnapshots,
  postPlatforms,
  platformConnections,
  posts,
} from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getValidToken } from "./token-refresh";
import { getAdapter } from "./platforms";
import type { Platform } from "@/lib/constants";

/**
 * Fetch fresh analytics from platform APIs for all published posts
 * belonging to a specific user.
 */
export async function fetchAnalyticsForUser(userId: string) {
  // Find all published post_platforms for this user
  const publishedPosts = await db
    .select({
      postPlatformId: postPlatforms.id,
      platform: postPlatforms.platform,
      nativePostId: postPlatforms.nativePostId,
      platformConnectionId: postPlatforms.platformConnectionId,
    })
    .from(postPlatforms)
    .innerJoin(posts, eq(posts.id, postPlatforms.postId))
    .where(
      and(
        eq(posts.userId, userId),
        eq(postPlatforms.status, "published")
      )
    );

  let fetched = 0;

  for (const pp of publishedPosts) {
    if (!pp.nativePostId || !pp.platformConnectionId) continue;

    try {
      const connection = await db.query.platformConnections.findFirst({
        where: eq(platformConnections.id, pp.platformConnectionId),
      });
      if (!connection) continue;

      const adapter = getAdapter(pp.platform as Platform);
      if (!adapter.fetchAnalytics) continue;

      const accessToken = await getValidToken(connection.id);
      const data = await adapter.fetchAnalytics({
        accessToken,
        nativePostId: pp.nativePostId,
        platformAccountId: connection.platformAccountId,
      });

      // Insert snapshot
      await db.insert(analyticsSnapshots).values({
        postPlatformId: pp.postPlatformId,
        impressions: data.impressions,
        engagements: data.engagements,
        clicks: data.clicks,
        likes: data.likes,
        shares: data.shares,
        comments: data.comments,
        reach: data.reach,
        snapshotAt: new Date(),
      });

      fetched++;
    } catch (err) {
      console.error(`Analytics fetch failed for ${pp.platform}:`, err);
    }
  }

  return { fetched };
}

/**
 * Get aggregated analytics for a user, optionally filtered by date range.
 */
export async function getAggregatedAnalytics(userId: string) {
  // Get latest snapshot per post_platform
  const results = await db
    .select({
      platform: postPlatforms.platform,
      impressions: sql<number>`COALESCE(SUM(${analyticsSnapshots.impressions}), 0)`,
      engagements: sql<number>`COALESCE(SUM(${analyticsSnapshots.engagements}), 0)`,
      clicks: sql<number>`COALESCE(SUM(${analyticsSnapshots.clicks}), 0)`,
      likes: sql<number>`COALESCE(SUM(${analyticsSnapshots.likes}), 0)`,
      shares: sql<number>`COALESCE(SUM(${analyticsSnapshots.shares}), 0)`,
      comments: sql<number>`COALESCE(SUM(${analyticsSnapshots.comments}), 0)`,
      reach: sql<number>`COALESCE(SUM(${analyticsSnapshots.reach}), 0)`,
    })
    .from(analyticsSnapshots)
    .innerJoin(postPlatforms, eq(postPlatforms.id, analyticsSnapshots.postPlatformId))
    .innerJoin(posts, eq(posts.id, postPlatforms.postId))
    .where(eq(posts.userId, userId))
    .groupBy(postPlatforms.platform);

  // Also get totals
  const totals = results.reduce(
    (acc, r) => ({
      impressions: acc.impressions + Number(r.impressions),
      engagements: acc.engagements + Number(r.engagements),
      clicks: acc.clicks + Number(r.clicks),
      likes: acc.likes + Number(r.likes),
      shares: acc.shares + Number(r.shares),
      comments: acc.comments + Number(r.comments),
      reach: acc.reach + Number(r.reach),
    }),
    { impressions: 0, engagements: 0, clicks: 0, likes: 0, shares: 0, comments: 0, reach: 0 }
  );

  return { byPlatform: results, totals };
}

/**
 * Get recent snapshots for charting (last 30 days).
 */
export async function getAnalyticsTimeline(userId: string) {
  const results = await db
    .select({
      date: sql<string>`DATE(${analyticsSnapshots.snapshotAt})`,
      impressions: sql<number>`SUM(${analyticsSnapshots.impressions})`,
      engagements: sql<number>`SUM(${analyticsSnapshots.engagements})`,
      reach: sql<number>`SUM(${analyticsSnapshots.reach})`,
    })
    .from(analyticsSnapshots)
    .innerJoin(postPlatforms, eq(postPlatforms.id, analyticsSnapshots.postPlatformId))
    .innerJoin(posts, eq(posts.id, postPlatforms.postId))
    .where(eq(posts.userId, userId))
    .groupBy(sql`DATE(${analyticsSnapshots.snapshotAt})`)
    .orderBy(desc(sql`DATE(${analyticsSnapshots.snapshotAt})`))
    .limit(30);

  return results.reverse();
}
