"use client";

import { useState, useEffect, useCallback } from "react";
import { PLATFORMS, type Platform } from "@/lib/constants";
import { PlatformIcon, TrendUpIcon } from "@/lib/icons";
import { toast } from "sonner";

interface PlatformMetric {
  platform: Platform;
  impressions: number;
  engagements: number;
  clicks: number;
  likes: number;
  shares: number;
  comments: number;
  reach: number;
}

interface TimelinePoint {
  date: string;
  impressions: number;
  engagements: number;
  reach: number;
}

interface Totals {
  impressions: number;
  engagements: number;
  clicks: number;
  likes: number;
  shares: number;
  comments: number;
  reach: number;
}

export default function AnalyticsPage() {
  const [totals, setTotals] = useState<Totals>({
    impressions: 0,
    engagements: 0,
    clicks: 0,
    likes: 0,
    shares: 0,
    comments: 0,
    reach: 0,
  });
  const [byPlatform, setByPlatform] = useState<PlatformMetric[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setTotals(data.totals);
        setByPlatform(data.byPlatform || []);
        setTimeline(data.timeline || []);
      }
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  }

  const metricCards = [
    { label: "Total Reach", value: totals.reach, icon: "reach" },
    { label: "Impressions", value: totals.impressions, icon: "impressions" },
    { label: "Engagements", value: totals.engagements, icon: "engagements" },
    { label: "Likes", value: totals.likes, icon: "likes" },
    { label: "Comments", value: totals.comments, icon: "comments" },
    { label: "Shares", value: totals.shares, icon: "shares" },
  ];

  // Simple bar chart using CSS
  const maxEngagement = Math.max(...timeline.map((t) => Number(t.engagements) || 1), 1);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Analytics</h1>
          <p className="text-sm text-text-secondary mt-1">
            Performance overview across all platforms.
          </p>
        </div>

        {/* Big metric cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-border-subtle bg-bg-surface animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {metricCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-border-subtle bg-bg-surface p-5"
              >
                <p className="text-xs text-text-tertiary mb-1">{card.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-text-primary">
                    {formatNumber(card.value)}
                  </span>
                  {card.value > 0 && (
                    <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                      <TrendUpIcon /> active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Engagement timeline chart */}
        {timeline.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-text-primary">
              Engagement Timeline
            </h2>
            <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
              <div className="flex items-end gap-1 h-32">
                {timeline.map((point) => {
                  const height = (Number(point.engagements) / maxEngagement) * 100;
                  return (
                    <div
                      key={point.date}
                      className="flex-1 group relative"
                    >
                      <div
                        className="w-full rounded-t bg-accent-cream/30 hover:bg-accent-cream/50 transition-colors"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block
                                      bg-bg-base border border-border-subtle rounded px-2 py-1 text-xs text-text-primary whitespace-nowrap z-10">
                        {point.date}: {formatNumber(Number(point.engagements))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-text-tertiary">
                <span>{timeline[0]?.date}</span>
                <span>{timeline[timeline.length - 1]?.date}</span>
              </div>
            </div>
          </section>
        )}

        {/* Platform breakdown */}
        {byPlatform.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-text-primary">
              By Platform
            </h2>
            <div className="space-y-3">
              {byPlatform.map((p) => (
                <div
                  key={p.platform}
                  className="rounded-xl border border-border-subtle bg-bg-surface p-4 flex items-center gap-4"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${PLATFORMS[p.platform as Platform]?.color || "gray"} 15%, transparent)`,
                      color: PLATFORMS[p.platform as Platform]?.color,
                    }}
                  >
                    <PlatformIcon platform={p.platform as Platform} size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {PLATFORMS[p.platform as Platform]?.label}
                    </p>
                  </div>
                  <div className="flex gap-6 text-xs text-text-secondary">
                    <span>{formatNumber(Number(p.reach))} reach</span>
                    <span>{formatNumber(Number(p.engagements))} eng.</span>
                    <span>{formatNumber(Number(p.likes))} likes</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && totals.impressions === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary mb-1">No analytics yet</p>
            <p className="text-xs text-text-tertiary">
              Publish posts to start tracking performance
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
