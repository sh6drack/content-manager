import { NextRequest, NextResponse } from "next/server";
import { REDDIT_POSTS, getAllSubreddits } from "@/services/reddit-content";

// GET — list all prepared Reddit posts
export async function GET() {
  return NextResponse.json({
    subreddits: getAllSubreddits(),
    totalPosts: REDDIT_POSTS.length,
    posts: REDDIT_POSTS.map((post) => ({
      subreddit: post.subreddit,
      title: post.title,
      bodyPreview: post.body.substring(0, 200) + "...",
      flair: post.flair,
    })),
  });
}

// POST — submit posts to Reddit
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    subreddits = getAllSubreddits(),
    accessToken,
    dryRun = false,
    delayBetweenPostsMs = 600000, // 10 minutes between posts (Reddit rate limits)
  } = body;

  if (!accessToken && !dryRun) {
    return NextResponse.json(
      { error: "Reddit access token required. Set REDDIT_ACCESS_TOKEN or pass accessToken." },
      { status: 400 }
    );
  }

  const postsToSubmit = REDDIT_POSTS.filter((p) => subreddits.includes(p.subreddit));

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      totalPosts: postsToSubmit.length,
      estimatedTimeMinutes: Math.ceil((postsToSubmit.length * delayBetweenPostsMs) / 60000),
      posts: postsToSubmit.map((p) => ({
        subreddit: `r/${p.subreddit}`,
        title: p.title,
      })),
    });
  }

  const results: { subreddit: string; success: boolean; url?: string; error?: string }[] = [];

  for (let i = 0; i < postsToSubmit.length; i++) {
    const post = postsToSubmit[i];

    try {
      const params = new URLSearchParams({
        sr: post.subreddit,
        kind: "self",
        title: post.title,
        text: post.body,
        api_type: "json",
      });

      if (post.flair) {
        params.set("flair_text", post.flair);
      }

      const res = await fetch("https://oauth.reddit.com/api/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "polarity-lab-content-manager/1.0",
        },
        body: params,
      });

      const data = await res.json();

      if (data.json?.errors?.length > 0) {
        throw new Error(JSON.stringify(data.json.errors));
      }

      results.push({
        subreddit: post.subreddit,
        success: true,
        url: data.json?.data?.url,
      });

      console.log(`[Reddit] Posted to r/${post.subreddit}: ${data.json?.data?.url}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({
        subreddit: post.subreddit,
        success: false,
        error: errorMsg,
      });
      console.error(`[Reddit] Failed r/${post.subreddit}:`, errorMsg);
    }

    // Wait between posts to avoid rate limiting
    if (i < postsToSubmit.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenPostsMs));
    }
  }

  return NextResponse.json({
    status: "completed",
    total: postsToSubmit.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  });
}
