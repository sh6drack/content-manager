import type { PlatformAdapter, PublishResult, AnalyticsData } from "./types";

// YouTube Data API v3 — resumable upload for videos

export const youtubeAdapter: PlatformAdapter = {
  async publish({ content, accessToken, mediaUrls }) {
    if (!mediaUrls || mediaUrls.length === 0) {
      throw new Error("YouTube requires a video to publish");
    }

    // Step 1: Start resumable upload session
    const title = content.substring(0, 100);
    const description = content;

    const initRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            title,
            description,
            categoryId: "22", // People & Blogs
          },
          status: {
            privacyStatus: "public",
            selfDeclaredMadeForKids: false,
          },
        }),
      }
    );

    if (!initRes.ok) throw new Error(`YouTube upload init failed: ${await initRes.text()}`);

    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) throw new Error("YouTube did not return upload URL");

    // Step 2: Download video and upload to YouTube
    const videoRes = await fetch(mediaUrls[0]);
    if (!videoRes.ok) throw new Error("Failed to fetch video for YouTube upload");

    const videoBuffer = await videoRes.arrayBuffer();

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": videoRes.headers.get("content-type") || "video/mp4",
        "Content-Length": String(videoBuffer.byteLength),
      },
      body: videoBuffer,
    });

    if (!uploadRes.ok) throw new Error(`YouTube upload failed: ${await uploadRes.text()}`);

    const video = await uploadRes.json();

    return {
      nativePostId: video.id,
      nativePostUrl: `https://www.youtube.com/watch?v=${video.id}`,
    } satisfies PublishResult;
  },

  async fetchAnalytics({ accessToken, nativePostId }) {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${nativePostId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) return defaultAnalytics();
    const data = await res.json();
    const stats = data.items?.[0]?.statistics || {};

    return {
      impressions: parseInt(stats.viewCount || "0"),
      engagements:
        parseInt(stats.likeCount || "0") +
        parseInt(stats.commentCount || "0"),
      clicks: 0,
      likes: parseInt(stats.likeCount || "0"),
      shares: 0,
      comments: parseInt(stats.commentCount || "0"),
      reach: parseInt(stats.viewCount || "0"),
    } satisfies AnalyticsData;
  },
};

function defaultAnalytics(): AnalyticsData {
  return { impressions: 0, engagements: 0, clicks: 0, likes: 0, shares: 0, comments: 0, reach: 0 };
}
