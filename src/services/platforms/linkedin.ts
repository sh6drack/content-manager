import type { PlatformAdapter, PublishResult, AnalyticsData } from "./types";

export const linkedinAdapter: PlatformAdapter = {
  async publish({ content, accessToken, mediaUrls, platformAccountId }) {
    const author = `urn:li:person:${platformAccountId}`;

    const body: Record<string, unknown> = {
      author,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: mediaUrls?.length ? "IMAGE" : "NONE",
          ...(mediaUrls?.length && {
            media: mediaUrls.map((url) => ({
              status: "READY",
              originalUrl: url,
              description: { text: "" },
              title: { text: "" },
            })),
          }),
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`LinkedIn publish failed: ${await res.text()}`);

    const postId = res.headers.get("x-restli-id") || "";

    return {
      nativePostId: postId,
      nativePostUrl: `https://www.linkedin.com/feed/update/${postId}/`,
    } satisfies PublishResult;
  },

  async fetchAnalytics({ accessToken, nativePostId }) {
    const res = await fetch(
      `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(nativePostId)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    if (!res.ok) return defaultAnalytics();
    const data = await res.json();

    return {
      impressions: 0,
      engagements: (data.likesSummary?.totalLikes || 0) + (data.commentsSummary?.totalFirstLevelComments || 0),
      clicks: 0,
      likes: data.likesSummary?.totalLikes || 0,
      shares: 0,
      comments: data.commentsSummary?.totalFirstLevelComments || 0,
      reach: 0,
    } satisfies AnalyticsData;
  },
};

function defaultAnalytics(): AnalyticsData {
  return { impressions: 0, engagements: 0, clicks: 0, likes: 0, shares: 0, comments: 0, reach: 0 };
}
