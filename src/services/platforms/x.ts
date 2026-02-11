import type { PlatformAdapter, PublishResult, MediaUploadResult, AnalyticsData } from "./types";

export const xAdapter: PlatformAdapter = {
  async publish({ content, accessToken, mediaIds }) {
    const body: Record<string, unknown> = { text: content };

    if (mediaIds && mediaIds.length > 0) {
      body.media = { media_ids: mediaIds };
    }

    const res = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`X publish failed: ${err}`);
    }

    const data = await res.json();
    return {
      nativePostId: data.data.id,
      nativePostUrl: `https://x.com/i/status/${data.data.id}`,
    } satisfies PublishResult;
  },

  async uploadMedia({ accessToken, url, mimeType }) {
    // X uses v1.1 media upload (chunked for large files)
    // Step 1: INIT
    const totalBytes = await fetch(url, { method: "HEAD" }).then(
      (r) => parseInt(r.headers.get("content-length") || "0")
    );

    const initRes = await fetch(
      "https://upload.twitter.com/1.1/media/upload.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          command: "INIT",
          total_bytes: String(totalBytes),
          media_type: mimeType,
        }),
      }
    );

    if (!initRes.ok) throw new Error(`X media INIT failed: ${await initRes.text()}`);
    const { media_id_string } = await initRes.json();

    // Step 2: APPEND - download and upload in chunks
    const mediaData = await fetch(url).then((r) => r.arrayBuffer());
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    const buffer = Buffer.from(mediaData);
    let segmentIndex = 0;

    for (let offset = 0; offset < buffer.length; offset += CHUNK_SIZE) {
      const chunk = buffer.subarray(offset, offset + CHUNK_SIZE);
      const formData = new FormData();
      formData.append("command", "APPEND");
      formData.append("media_id", media_id_string);
      formData.append("segment_index", String(segmentIndex));
      formData.append("media_data", new Blob([chunk]));

      const appendRes = await fetch(
        "https://upload.twitter.com/1.1/media/upload.json",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        }
      );

      if (!appendRes.ok) throw new Error(`X media APPEND failed: ${await appendRes.text()}`);
      segmentIndex++;
    }

    // Step 3: FINALIZE
    const finalRes = await fetch(
      "https://upload.twitter.com/1.1/media/upload.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          command: "FINALIZE",
          media_id: media_id_string,
        }),
      }
    );

    if (!finalRes.ok) throw new Error(`X media FINALIZE failed: ${await finalRes.text()}`);

    return { mediaId: media_id_string } satisfies MediaUploadResult;
  },

  async fetchAnalytics({ accessToken, nativePostId }) {
    const res = await fetch(
      `https://api.twitter.com/2/tweets/${nativePostId}?tweet.fields=public_metrics`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) throw new Error(`X analytics fetch failed: ${await res.text()}`);
    const data = await res.json();
    const m = data.data?.public_metrics || {};

    return {
      impressions: m.impression_count || 0,
      engagements: (m.like_count || 0) + (m.retweet_count || 0) + (m.reply_count || 0),
      clicks: 0,
      likes: m.like_count || 0,
      shares: m.retweet_count || 0,
      comments: m.reply_count || 0,
      reach: m.impression_count || 0,
    } satisfies AnalyticsData;
  },
};
