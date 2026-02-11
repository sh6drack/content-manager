"use client";

import { ChevronLeft, ChevronRight, ChevronDown, PlusIcon } from "@/lib/icons";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export type ViewMode = "Month" | "Week" | "List";

export function Header({
  year,
  month,
  viewMode,
  onViewModeChange,
  onPrevMonth,
  onNextMonth,
  onCreateClick,
}: {
  year: number;
  month: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCreateClick: () => void;
}) {
  return (
    <header className="h-[72px] flex items-center justify-between px-8 border-b border-border-subtle backdrop-blur-[10px] shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[18px] font-medium tracking-tight text-text-primary">
          {MONTH_NAMES[month]} {year}
          <ChevronDown />
        </div>
        <div className="flex gap-1">
          <button
            onClick={onPrevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-md text-text-secondary cursor-pointer transition-all duration-200 hover:bg-bg-surface-hover hover:text-text-primary"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={onNextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-md text-text-secondary cursor-pointer transition-all duration-200 hover:bg-bg-surface-hover hover:text-text-primary"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-white/[0.03] p-[3px] rounded-lg border border-border-subtle">
          {(["Month", "Week", "List"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`
                px-3 py-1.5 rounded-md text-[12px] font-medium cursor-pointer transition-all duration-200
                ${
                  viewMode === mode
                    ? "bg-white/[0.08] text-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                    : "text-text-secondary hover:text-text-primary"
                }
              `}
            >
              {mode}
            </button>
          ))}
        </div>

        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 bg-accent-cream text-[#1a1520] px-4 py-2 rounded-md font-semibold text-[13px] cursor-pointer transition-all duration-200 hover:brightness-110 hover:-translate-y-px active:translate-y-0"
        >
          <PlusIcon />
          Create
        </button>
      </div>
    </header>
  );
}
