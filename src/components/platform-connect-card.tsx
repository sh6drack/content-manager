"use client";

import { useState } from "react";
import { PlatformIcon } from "@/lib/icons";
import { PLATFORMS, type Platform } from "@/lib/constants";
import { toast } from "sonner";

interface PlatformConnection {
  id: string;
  platform: Platform;
  platformUsername: string | null;
  connectedAt: string;
  tokenExpiresAt: string | null;
}

export function PlatformConnectCard({
  platform,
  connection,
  onDisconnect,
}: {
  platform: Platform;
  connection?: PlatformConnection;
  onDisconnect: (platform: Platform) => void;
}) {
  const [disconnecting, setDisconnecting] = useState(false);
  const config = PLATFORMS[platform];

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const res = await fetch(`/api/platforms/${platform}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      onDisconnect(platform);
      toast.success(`Disconnected from ${config.label}`);
    } catch {
      toast.error(`Failed to disconnect from ${config.label}`);
    } finally {
      setDisconnecting(false);
    }
  }

  const isExpired =
    connection?.tokenExpiresAt &&
    new Date(connection.tokenExpiresAt) < new Date();

  return (
    <div className="relative rounded-xl border border-border-subtle bg-bg-surface p-5 transition-all duration-200 hover:border-border-subtle/80">
      {/* Platform header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)`,
            color: config.color,
          }}
        >
          <PlatformIcon platform={platform} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-text-primary">
            {config.label}
          </h3>
          {connection ? (
            <p className="text-xs text-text-secondary truncate">
              @{connection.platformUsername || "connected"}
            </p>
          ) : (
            <p className="text-xs text-text-tertiary">Not connected</p>
          )}
        </div>
      </div>

      {/* Status + action */}
      {connection ? (
        <div className="space-y-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isExpired ? "bg-red-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`text-xs ${
                isExpired ? "text-red-400" : "text-text-secondary"
              }`}
            >
              {isExpired ? "Token expired" : "Connected"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isExpired && (
              <a
                href={`/api/platforms/${platform}/connect`}
                className="flex-1 inline-flex items-center justify-center h-8 rounded-lg text-xs font-medium
                           bg-accent-cream/10 text-accent-cream hover:bg-accent-cream/20 transition-colors"
              >
                Reconnect
              </a>
            )}
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex-1 inline-flex items-center justify-center h-8 rounded-lg text-xs font-medium
                         bg-bg-surface-hover text-text-secondary hover:text-red-400 hover:bg-red-400/10
                         transition-colors disabled:opacity-50 cursor-pointer"
            >
              {disconnecting ? "..." : "Disconnect"}
            </button>
          </div>
        </div>
      ) : (
        <a
          href={`/api/platforms/${platform}/connect`}
          className="w-full inline-flex items-center justify-center h-9 rounded-lg text-xs font-medium
                     border border-border-subtle text-text-secondary
                     hover:border-accent-cream/30 hover:text-accent-cream hover:bg-accent-cream/5
                     transition-all duration-200"
        >
          Connect {config.label}
        </a>
      )}
    </div>
  );
}
