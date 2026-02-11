"use client";

import { useEffect, useState } from "react";
import { PLATFORMS, Platform } from "@/lib/constants";
import { PlatformIcon, TrendUpIcon } from "@/lib/icons";

const CHANNELS: Platform[] = ["linkedin", "instagram", "x", "youtube", "tiktok", "threads"];

function MetricCard({
  label,
  value,
  trend,
  delay,
}: {
  label: string;
  value: string;
  trend: string;
  delay: number;
}) {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-2xl p-4 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-text-secondary text-[11px] mb-1">{label}</div>
      <div className="text-[20px] font-semibold text-text-primary tracking-tight">
        {value}
      </div>
      <div className="flex items-center gap-1 mt-2 text-[11px] text-status-success">
        <TrendUpIcon />
        {trend}
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function Sidebar() {
  const [stats, setStats] = useState<{
    reach: number;
    engagements: number;
    scheduled: number;
  }>({ reach: 0, engagements: 0, scheduled: 0 });

  useEffect(() => {
    // Fetch real metrics
    Promise.all([
      fetch("/api/analytics").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/posts?stats=true").then((r) => (r.ok ? r.json() : null)),
    ]).then(([analytics, postsData]) => {
      const reach = analytics?.totals?.reach || 0;
      const engagements = analytics?.totals?.engagements || 0;
      const scheduledCount =
        postsData?.stats?.find(
          (s: { status: string; count: number }) => s.status === "scheduled"
        )?.count || 0;

      setStats({ reach, engagements, scheduled: scheduledCount });
    });
  }, []);

  const engagementRate =
    stats.reach > 0
      ? `${((stats.engagements / stats.reach) * 100).toFixed(1)}%`
      : "0%";

  return (
    <aside className="border-r border-border-subtle p-6 flex flex-col gap-8 bg-bg-sidebar overflow-y-auto">
      {/* Channels */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-text-tertiary mb-3 font-semibold">
          Channels
        </div>
        <ul className="flex flex-col gap-1">
          {CHANNELS.map((platform) => (
            <li
              key={platform}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-text-secondary font-medium cursor-pointer transition-all duration-200 hover:bg-bg-surface-hover hover:text-text-primary group"
            >
              <div
                className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ color: PLATFORMS[platform].color }}
              >
                <PlatformIcon platform={platform} size={16} />
              </div>
              <span className="text-[13px]">{PLATFORMS[platform].label}</span>
              <div
                className="w-1.5 h-1.5 rounded-full ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: PLATFORMS[platform].color }}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Metrics */}
      <MetricCard
        label="Total Reach"
        value={formatNumber(stats.reach)}
        trend={stats.reach > 0 ? "across all platforms" : "publish to start tracking"}
        delay={100}
      />
      <MetricCard
        label="Engagement"
        value={engagementRate}
        trend={stats.engagements > 0 ? `${formatNumber(stats.engagements)} total` : "no data yet"}
        delay={200}
      />
      <MetricCard
        label="Scheduled"
        value={String(stats.scheduled)}
        trend={stats.scheduled > 0 ? "posts queued" : "no posts queued"}
        delay={300}
      />
    </aside>
  );
}
