"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PlatformConnectCard } from "@/components/platform-connect-card";
import { PLATFORMS, type Platform } from "@/lib/constants";
import { toast } from "sonner";

interface PlatformConnection {
  id: string;
  platform: Platform;
  platformUsername: string | null;
  connectedAt: string;
  tokenExpiresAt: string | null;
}

const ALL_PLATFORMS = Object.keys(PLATFORMS) as Platform[];

function SettingsContent() {
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/platforms");
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections);
      }
    } catch {
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Handle OAuth callback messages
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected) {
      toast.success(`Connected to ${PLATFORMS[connected as Platform]?.label || connected}`);
      fetchConnections();
      window.history.replaceState({}, "", "/settings");
    }
    if (error) {
      const messages: Record<string, string> = {
        unknown_platform: "Unknown platform",
        missing_params: "OAuth flow was interrupted",
        invalid_state: "Security check failed — try again",
        token_exchange_failed: "Could not complete authorization",
        callback_failed: "Something went wrong during connection",
      };
      toast.error(messages[error] || `Connection error: ${error}`);
      window.history.replaceState({}, "", "/settings");
    }
  }, [searchParams, fetchConnections]);

  function handleDisconnect(platform: Platform) {
    setConnections((prev) => prev.filter((c) => c.platform !== platform));
  }

  const connectedCount = connections.length;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your connected platforms and account preferences.
          </p>
        </div>

        {/* Platforms section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-text-primary">
                Platforms
              </h2>
              <p className="text-xs text-text-tertiary mt-0.5">
                {connectedCount} of {ALL_PLATFORMS.length} connected
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_PLATFORMS.map((p) => (
                <div
                  key={p}
                  className="h-[152px] rounded-xl border border-border-subtle bg-bg-surface animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_PLATFORMS.map((platform) => {
                const connection = connections.find(
                  (c) => c.platform === platform
                );
                return (
                  <PlatformConnectCard
                    key={platform}
                    platform={platform}
                    connection={connection}
                    onDisconnect={handleDisconnect}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Account section placeholder */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-text-primary">Account</h2>
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
            <p className="text-xs text-text-tertiary">
              Account management coming soon.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
              <p className="text-sm text-text-secondary mt-1">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
