import { Platform, PostStatus } from "./constants";

export interface Post {
  id: string;
  title: string;
  platform: Platform;
  status: PostStatus;
  time?: string;
  content?: string;
}

export interface CalendarDay {
  day: number;
  otherMonth?: boolean;
  today?: boolean;
  posts?: Post[];
}

export function generateCalendarData(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Monday = 0, Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells: CalendarDay[] = [];

  // Previous month trailing days
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ day: prevMonthLastDay - i, otherMonth: true });
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      today: isCurrentMonth && today.getDate() === d,
      posts: MOCK_POSTS_BY_DAY[d] || undefined,
    });
  }

  // Next month leading days to fill grid (6 rows × 7 = 42 cells)
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, otherMonth: true });
  }

  return cells;
}

// Sample posts scattered across the month
const MOCK_POSTS_BY_DAY: Record<number, Post[]> = {
  1: [
    { id: "p1", title: "Product Teaser Reel", platform: "instagram", status: "published", time: "9:00" },
  ],
  3: [
    { id: "p2", title: "Design System Analysis", platform: "linkedin", status: "scheduled", time: "10:30" },
    { id: "p3", title: "Thread: Color Theory", platform: "x", status: "scheduled", time: "14:00" },
  ],
  4: [
    { id: "p4", title: "BTS Setup Tour", platform: "tiktok", status: "draft" },
  ],
  7: [
    { id: "p5", title: "Brand identity breakdown", platform: "threads", status: "scheduled", time: "11:00" },
  ],
  8: [
    { id: "p6", title: "Weekly Vlog #42", platform: "youtube", status: "published", time: "18:00" },
  ],
  10: [
    { id: "p7", title: "Carousel: Top Tools", platform: "instagram", status: "draft" },
  ],
  11: [
    { id: "p8", title: "Hiring Update", platform: "linkedin", status: "scheduled", time: "09:00" },
    { id: "p9", title: "Q&A Live Announce", platform: "x", status: "failed", time: "12:00" },
  ],
  13: [
    { id: "p10", title: "Quick Tip: Figma", platform: "tiktok", status: "scheduled" },
  ],
  15: [
    { id: "p11", title: "Community spotlight", platform: "threads", status: "published", time: "10:00" },
  ],
  17: [
    { id: "p12", title: "Tutorial: Dark Mode", platform: "youtube", status: "scheduled", time: "17:00" },
    { id: "p13", title: "Link Drop", platform: "x", status: "published", time: "12:00" },
  ],
  20: [
    { id: "p14", title: "Studio walkthrough", platform: "tiktok", status: "draft" },
    { id: "p15", title: "New portfolio launch", platform: "instagram", status: "scheduled", time: "15:00" },
    { id: "p16", title: "Announcement thread", platform: "linkedin", status: "scheduled", time: "09:00" },
  ],
  23: [
    { id: "p17", title: "Weekend recap reel", platform: "instagram", status: "draft" },
  ],
  25: [
    { id: "p18", title: "Monthly roundup", platform: "youtube", status: "scheduled", time: "18:00" },
    { id: "p19", title: "Hot takes", platform: "x", status: "draft" },
  ],
  28: [
    { id: "p20", title: "Client testimonial", platform: "linkedin", status: "scheduled", time: "10:00" },
  ],
};
