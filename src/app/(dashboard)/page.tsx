"use client";

import { useState, useMemo } from "react";
import { Header, ViewMode } from "@/components/header";
import { Calendar } from "@/components/calendar";
import { usePosts } from "@/hooks/use-posts";
import { generateCalendarData, type CalendarDay } from "@/lib/mock-data";
import type { Platform, PostStatus } from "@/lib/constants";

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [viewMode, setViewMode] = useState<ViewMode>("Month");

  const { posts, isLoading } = usePosts(year, month);

  // Generate calendar grid, merging real posts into it
  const calendarDays = useMemo(() => {
    const days = generateCalendarData(year, month);

    // If we have real posts from the API, overlay them onto the calendar
    if (posts && posts.length > 0) {
      // Clear mock posts first
      for (const day of days) {
        if (!day.otherMonth) {
          day.posts = [];
        }
      }

      // Map API posts to calendar days
      for (const post of posts) {
        const postDate = post.scheduledFor
          ? new Date(post.scheduledFor)
          : new Date(post.createdAt);
        const postDay = postDate.getDate();
        const postMonth = postDate.getMonth();

        // Only add if the post belongs to the current month view
        if (postMonth === month) {
          const cell = days.find((d) => d.day === postDay && !d.otherMonth);
          if (cell) {
            if (!cell.posts) cell.posts = [];
            // Map each post_platform as a separate pill
            if (post.platforms && post.platforms.length > 0) {
              for (const pp of post.platforms) {
                cell.posts.push({
                  id: `${post.id}-${pp.platform}`,
                  title: post.title || post.content.substring(0, 40),
                  platform: pp.platform as Platform,
                  status: (pp.status === "pending" ? post.status : pp.status) as PostStatus,
                  time: post.scheduledFor
                    ? new Date(post.scheduledFor).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : undefined,
                  content: post.content,
                });
              }
            }
          }
        }
      }
    }

    return days;
  }, [year, month, posts]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <>
      <Header
        year={year}
        month={month}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onCreateClick={() => {
          // Dispatch compose event — the layout handles the modal
          window.dispatchEvent(new CustomEvent("open-compose"));
        }}
      />
      <Calendar
        days={calendarDays}
        isLoading={isLoading}
        onPostClick={(id) => console.log("Open post:", id)}
        onDayClick={(day) => console.log("Clicked day:", day)}
      />
    </>
  );
}
