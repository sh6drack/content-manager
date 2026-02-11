import type { PlatformAdapter, PublishResult } from "./types";

// TikTok Content Posting API — video-only platform
// Note: Requires approved TikTok developer app (review takes 2-4 weeks)

export const tiktokAdapter: PlatformAdapter = {
  async publish({ content, accessToken, mediaUrls }) {
    if (!mediaUrls || mediaUrls.length === 0) {
      throw new Error("TikTok requires a video to publish");
    }

    // Step 1: Initialize video upload
    const initRes = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/video/init/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: {
            title: content.substring(0, 150),
            privacy_level: "SELF_ONLY", // Start private, user can change on TikTok
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: mediaUrls[0],
          },
        }),
      }
    );

    if (!initRes.ok) throw new Error(`TikTok init failed: ${await initRes.text()}`);
    const initData = await initRes.json();

    const publishId = initData.data?.publish_id;
    if (!publishId) throw new Error("TikTok did not return a publish_id");

    // Step 2: Poll for publish status
    let nativePostId = "";
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 3000));

      const statusRes = await fetch(
        "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publish_id: publishId }),
        }
      );

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        const status = statusData.data?.status;

        if (status === "PUBLISH_COMPLETE") {
          nativePostId = statusData.data?.publicaly_available_post_id?.[0] || publishId;
          break;
        }
        if (status === "FAILED") {
          throw new Error(`TikTok publish failed: ${statusData.data?.fail_reason || "unknown"}`);
        }
      }
    }

    return {
      nativePostId: nativePostId || publishId,
      nativePostUrl: nativePostId
        ? `https://www.tiktok.com/@/video/${nativePostId}`
        : "",
    } satisfies PublishResult;
  },
};
