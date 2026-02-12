import type { Platform } from "@/lib/constants";
import type { PlatformAdapter } from "./types";
import { xAdapter } from "./x";
import { instagramAdapter } from "./instagram";
import { linkedinAdapter } from "./linkedin";
import { tiktokAdapter } from "./tiktok";
import { youtubeAdapter } from "./youtube";
import { threadsAdapter } from "./threads";
import { redditAdapter } from "./reddit";

const adapters: Record<Platform, PlatformAdapter> = {
  x: xAdapter,
  instagram: instagramAdapter,
  linkedin: linkedinAdapter,
  tiktok: tiktokAdapter,
  youtube: youtubeAdapter,
  threads: threadsAdapter,
  reddit: redditAdapter,
};

export function getAdapter(platform: Platform): PlatformAdapter {
  const adapter = adapters[platform];
  if (!adapter) throw new Error(`No adapter for platform: ${platform}`);
  return adapter;
}

export type { PlatformAdapter, PublishResult, MediaUploadResult, AnalyticsData } from "./types";
