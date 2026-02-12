import type { PlatformAdapter, PublishResult } from "./types";

export const redditAdapter: PlatformAdapter = {
  async publish({ content, accessToken, platformAccountId }) {
    // Reddit posts need a subreddit target — passed via metadata in content
    // Content format: "subreddit:SUBREDDIT_NAME\ntitle:POST_TITLE\n---\nBODY"
    const lines = content.split("\n");
    let subreddit = "";
    let title = "";
    let body = "";
    let inBody = false;

    for (const line of lines) {
      if (line.startsWith("subreddit:")) {
        subreddit = line.replace("subreddit:", "").trim();
      } else if (line.startsWith("title:")) {
        title = line.replace("title:", "").trim();
      } else if (line === "---") {
        inBody = true;
      } else if (inBody) {
        body += (body ? "\n" : "") + line;
      }
    }

    if (!subreddit) throw new Error("Reddit post missing subreddit");
    if (!title) throw new Error("Reddit post missing title");

    // Submit as self post via Reddit API
    const params = new URLSearchParams({
      sr: subreddit,
      kind: "self",
      title,
      text: body || "",
      api_type: "json",
    });

    const res = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "polarity-lab-content-manager/1.0",
      },
      body: params,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Reddit publish failed: ${err}`);
    }

    const data = await res.json();
    const postData = data.json?.data;

    if (data.json?.errors?.length > 0) {
      throw new Error(`Reddit errors: ${JSON.stringify(data.json.errors)}`);
    }

    return {
      nativePostId: postData?.id || postData?.name || "",
      nativePostUrl: postData?.url || `https://reddit.com${postData?.permalink || ""}`,
    } satisfies PublishResult;
  },

  async fetchAnalytics({ accessToken, nativePostId }) {
    const res = await fetch(
      `https://oauth.reddit.com/api/info?id=t3_${nativePostId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "polarity-lab-content-manager/1.0",
        },
      }
    );

    if (!res.ok) throw new Error(`Reddit analytics fetch failed`);
    const data = await res.json();
    const post = data.data?.children?.[0]?.data;

    return {
      impressions: post?.view_count || 0,
      engagements: (post?.ups || 0) + (post?.num_comments || 0),
      clicks: 0,
      likes: post?.ups || 0,
      shares: post?.num_crossposts || 0,
      comments: post?.num_comments || 0,
      reach: post?.view_count || 0,
    };
  },
};
