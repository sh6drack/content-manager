export type Platform = "x" | "instagram" | "linkedin" | "tiktok" | "youtube" | "threads" | "reddit";
export type PostStatus = "draft" | "scheduled" | "publishing" | "published" | "failed";

export const PLATFORMS: Record<
  Platform,
  { label: string; color: string; charLimit: number }
> = {
  x: { label: "X", color: "var(--brand-x)", charLimit: 280 },
  instagram: { label: "Instagram", color: "var(--brand-ig)", charLimit: 2200 },
  linkedin: { label: "LinkedIn", color: "var(--brand-li)", charLimit: 3000 },
  tiktok: { label: "TikTok", color: "var(--brand-tt)", charLimit: 4000 },
  youtube: { label: "YouTube", color: "var(--brand-yt)", charLimit: 5000 },
  threads: { label: "Threads", color: "var(--brand-threads)", charLimit: 500 },
  reddit: { label: "Reddit", color: "var(--brand-reddit, #ff4500)", charLimit: 40000 },
};

export const STATUS_OPACITY: Record<PostStatus, number> = {
  draft: 0.4,
  scheduled: 0.8,
  publishing: 0.9,
  published: 1,
  failed: 1,
};

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
