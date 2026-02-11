"use client";

import { WEEKDAYS } from "@/lib/constants";
import { CalendarDay } from "@/lib/mock-data";
import { PostPill } from "./post-pill";

export function Calendar({
  days,
  isLoading,
  onPostClick,
  onDayClick,
}: {
  days: CalendarDay[];
  isLoading?: boolean;
  onPostClick?: (postId: string) => void;
  onDayClick?: (day: number) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-3 px-px">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="uppercase text-[10px] font-semibold tracking-widest text-text-tertiary pl-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="grid grid-cols-7 gap-px bg-border-subtle border border-border-subtle rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}
      >
        {days.map((cell, idx) => (
          <div
            key={idx}
            onClick={() => !cell.otherMonth && onDayClick?.(cell.day)}
            className={`
              min-h-[140px] p-3 relative transition-colors duration-200 cursor-pointer
              ${cell.otherMonth ? "bg-bg-cell-muted opacity-50" : "bg-bg-cell hover:bg-bg-cell-hover"}
            `}
            style={{
              animationDelay: `${idx * 15}ms`,
            }}
          >
            {/* Day number */}
            <span
              className={`
                text-[13px] mb-3 block
                ${
                  cell.today
                    ? "inline-flex w-6 h-6 items-center justify-center bg-accent-cream-10 rounded-full text-accent-cream font-bold"
                    : "text-text-secondary"
                }
              `}
            >
              {cell.day}
            </span>

            {/* Posts */}
            {cell.posts && cell.posts.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {cell.posts.map((post) => (
                  <PostPill
                    key={post.id}
                    platform={post.platform}
                    title={post.title}
                    time={post.time}
                    status={post.status}
                    onClick={() => onPostClick?.(post.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
