"use client";

import { CalendarIcon, ComposeIcon, MediaIcon, AnalyticsIcon } from "@/lib/icons";

export type NavSection = "calendar" | "compose" | "media" | "analytics" | "settings";

function SettingsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

const NAV_ITEMS: { id: NavSection; icon: React.ReactNode; dividerAfter?: boolean }[] = [
  { id: "calendar", icon: <CalendarIcon /> },
  { id: "compose", icon: <ComposeIcon />, dividerAfter: true },
  { id: "media", icon: <MediaIcon /> },
  { id: "analytics", icon: <AnalyticsIcon /> },
];

export function NavRail({
  active,
  onChange,
}: {
  active: NavSection;
  onChange: (id: NavSection) => void;
}) {
  return (
    <nav className="flex flex-col items-center border-r border-border-subtle bg-bg-rail pt-6 pb-6 gap-6 backdrop-blur-[10px]">
      {/* Brand mark */}
      <div
        className="w-7 h-7 mb-2"
        style={{
          background: "linear-gradient(135deg, var(--accent-cream), var(--accent-glow))",
          mask: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E\") no-repeat center",
          maskSize: "contain",
          WebkitMask:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E\") no-repeat center",
          WebkitMaskSize: "contain",
        }}
      />

      {NAV_ITEMS.map((item) => (
        <div key={item.id}>
          <button
            onClick={() => onChange(item.id)}
            className={`
              w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer
              transition-all duration-200 ease-out
              ${
                active === item.id
                  ? "bg-accent-cream-10 text-accent-cream shadow-[0_0_0_1px_rgba(221,203,186,0.1)_inset]"
                  : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
              }
            `}
          >
            {item.icon}
          </button>
          {item.dividerAfter && (
            <div className="w-4 h-px bg-border-subtle mx-auto my-3" />
          )}
        </div>
      ))}

      {/* Settings at bottom */}
      <div className="mt-auto">
        <button
          onClick={() => onChange("settings")}
          className={`
            w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer
            transition-all duration-200 ease-out
            ${
              active === "settings"
                ? "bg-accent-cream-10 text-accent-cream shadow-[0_0_0_1px_rgba(221,203,186,0.1)_inset]"
                : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
            }
          `}
        >
          <SettingsIcon />
        </button>
      </div>
    </nav>
  );
}
