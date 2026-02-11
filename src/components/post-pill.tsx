"use client";

import { PLATFORMS, STATUS_OPACITY, type Platform, type PostStatus } from "@/lib/constants";

export function PostPill({
  platform,
  title,
  time,
  status,
  onClick,
}: {
  platform: Platform;
  title: string;
  time?: string;
  status: PostStatus;
  onClick?: () => void;
}) {
  const color = PLATFORMS[platform].color;
  const opacity = STATUS_OPACITY[status];
  const isFailed = status === "failed";

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-2 py-1.5 w-full text-left
        bg-white/[0.03] border border-white/[0.05] rounded-[4px]
        cursor-pointer transition-all duration-200
        hover:bg-white/[0.06] hover:border-white/[0.1] hover:-translate-y-px
        ${isFailed ? "animate-pulse-fail" : ""}
      `}
      style={{ opacity }}
    >
      {/* Platform dot with glow */}
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />

      {/* Title */}
      <span className="text-[11px] text-text-primary font-medium truncate">
        {title}
      </span>

      {/* Time */}
      {time && (
        <span className="text-[10px] text-text-tertiary ml-auto shrink-0">
          {time}
        </span>
      )}

      {/* Status indicator dot */}
      {status === "draft" && (
        <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-accent-cream-dim" />
      )}
    </button>
  );
}
