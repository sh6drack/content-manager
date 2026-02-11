import type { PlatformAdapter, PublishResult, AnalyticsData } from "./types";

// Instagram uses the Container → Publish two-step flow via Meta Graph API
// Requires a Business/Creator account + Facebook Page

export const instagramAdapter: PlatformAdapter = {
  async publish({ content, accessToken, mediaUrls, platformAccountId }) {
    const igUserId = platformAccountId;
    if (!igUserId) throw new Error("Instagram user ID not available");

    let containerId: string;

    if (mediaUrls && mediaUrls.length > 0) {
      if (mediaUrls.length === 1) {
        // Single media post
        const isVideo = mediaUrls[0].match(/\.(mp4|mov|avi)$/i);
        const createRes = await fetch(
          `https://graph.facebook.com/v21.0/${igUserId}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              [isVideo ? "video_url" : "image_url"]: mediaUrls[0],
              caption: content,
              access_token: accessToken,
            }),
          }
        );
        if (!createRes.ok) throw new Error(`IG container create failed: ${await createRes.text()}`);
        const created = await createRes.json();
        containerId = created.id;
      } else {
        // Carousel post — create children first, then carousel container
        const childIds: string[] = [];
        for (const url of mediaUrls.slice(0, 10)) {
          const isVideo = url.match(/\.(mp4|mov|avi)$/i);
          const childRes = await fetch(
            `https://graph.facebook.com/v21.0/${igUserId}/media`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                [isVideo ? "video_url" : "image_url"]: url,
                is_carousel_item: true,
                access_token: accessToken,
              }),
            }
          );
          if (!childRes.ok) throw new Error(`IG carousel child failed: ${await childRes.text()}`);
          const child = await childRes.json();
          childIds.push(child.id);
        }

        const carouselRes = await fetch(
          `https://graph.facebook.com/v21.0/${igUserId}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              media_type: "CAROUSEL",
              children: childIds,
              caption: content,
              access_token: accessToken,
            }),
          }
        );
        if (!carouselRes.ok) throw new Error(`IG carousel create failed: ${await carouselRes.text()}`);
        const carousel = await carouselRes.json();
        containerId = carousel.id;
      }
    } else {
      // Text-only not supported on IG — would need a placeholder image
      throw new Error("Instagram requires at least one image or video");
    }

    // Wait for container to be ready (IG processes async)
    await waitForContainer(containerId, accessToken);

    // Publish the container
    const publishRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );

    if (!publishRes.ok) throw new Error(`IG publish failed: ${await publishRes.text()}`);
    const published = await publishRes.json();

    return {
      nativePostId: published.id,
      nativePostUrl: `https://www.instagram.com/p/${published.id}/`,
    } satisfies PublishResult;
  },

  async fetchAnalytics({ accessToken, nativePostId }) {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${nativePostId}/insights?metric=impressions,reach,likes,comments,shares&access_token=${accessToken}`
    );

    if (!res.ok) return defaultAnalytics();
    const data = await res.json();

    const metrics: Record<string, number> = {};
    for (const item of data.data || []) {
      metrics[item.name] = item.values?.[0]?.value || 0;
    }

    return {
      impressions: metrics.impressions || 0,
      engagements: (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0),
      clicks: 0,
      likes: metrics.likes || 0,
      shares: metrics.shares || 0,
      comments: metrics.comments || 0,
      reach: metrics.reach || 0,
    } satisfies AnalyticsData;
  },
};

async function waitForContainer(containerId: string, accessToken: string, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.status_code === "FINISHED") return;
      if (data.status_code === "ERROR") throw new Error("IG container processing failed");
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("IG container processing timed out");
}

function defaultAnalytics(): AnalyticsData {
  return { impressions: 0, engagements: 0, clicks: 0, likes: 0, shares: 0, comments: 0, reach: 0 };
}
