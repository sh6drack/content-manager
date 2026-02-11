import type { PlatformAdapter, PublishResult, AnalyticsData } from "./types";

// Threads API — Container → Publish flow (similar to Instagram)

export const threadsAdapter: PlatformAdapter = {
  async publish({ content, accessToken, mediaUrls, platformAccountId }) {
    const userId = platformAccountId;
    if (!userId) throw new Error("Threads user ID not available");

    // Step 1: Create container
    const containerBody: Record<string, string> = {
      text: content,
      access_token: accessToken,
    };

    if (mediaUrls && mediaUrls.length > 0) {
      const isVideo = mediaUrls[0].match(/\.(mp4|mov|avi)$/i);
      containerBody.media_type = isVideo ? "VIDEO" : "IMAGE";
      containerBody[isVideo ? "video_url" : "image_url"] = mediaUrls[0];
    } else {
      containerBody.media_type = "TEXT";
    }

    const createRes = await fetch(
      `https://graph.threads.net/v1.0/${userId}/threads`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(containerBody),
      }
    );

    if (!createRes.ok) throw new Error(`Threads container create failed: ${await createRes.text()}`);
    const created = await createRes.json();
    const containerId = created.id;

    // Step 2: Wait for processing
    await waitForContainer(containerId, accessToken);

    // Step 3: Publish
    const publishRes = await fetch(
      `https://graph.threads.net/v1.0/${userId}/threads_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );

    if (!publishRes.ok) throw new Error(`Threads publish failed: ${await publishRes.text()}`);
    const published = await publishRes.json();

    return {
      nativePostId: published.id,
      nativePostUrl: `https://www.threads.net/post/${published.id}`,
    } satisfies PublishResult;
  },

  async fetchAnalytics({ accessToken, nativePostId }) {
    const res = await fetch(
      `https://graph.threads.net/v1.0/${nativePostId}/insights?metric=views,likes,replies,reposts&access_token=${accessToken}`
    );

    if (!res.ok) return defaultAnalytics();
    const data = await res.json();

    const metrics: Record<string, number> = {};
    for (const item of data.data || []) {
      metrics[item.name] = item.values?.[0]?.value || 0;
    }

    return {
      impressions: metrics.views || 0,
      engagements: (metrics.likes || 0) + (metrics.replies || 0) + (metrics.reposts || 0),
      clicks: 0,
      likes: metrics.likes || 0,
      shares: metrics.reposts || 0,
      comments: metrics.replies || 0,
      reach: metrics.views || 0,
    } satisfies AnalyticsData;
  },
};

async function waitForContainer(containerId: string, accessToken: string, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `https://graph.threads.net/v1.0/${containerId}?fields=status&access_token=${accessToken}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.status === "FINISHED") return;
      if (data.status === "ERROR") throw new Error("Threads container processing failed");
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Threads container processing timed out");
}

function defaultAnalytics(): AnalyticsData {
  return { impressions: 0, engagements: 0, clicks: 0, likes: 0, shares: 0, comments: 0, reach: 0 };
}
