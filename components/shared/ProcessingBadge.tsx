"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import type { ProcessingTier } from "@/lib/tool-processing";

export type { ProcessingTier };

const TIER_CONFIG = {
  local: {
    icon: "shield_lock",
    labelKey: "badge.local" as const,
    longKey: "badge.localProcessing" as const,
    chipIcon: "bg-emerald-400/25 text-emerald-50 ring-emerald-300/30",
    chipDot: "bg-emerald-300",
    surface:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50",
  },
  server: {
    icon: "cloud_upload",
    labelKey: "badge.server" as const,
    longKey: "badge.serverProcessing" as const,
    chipIcon: "bg-amber-400/25 text-amber-50 ring-amber-300/30",
    chipDot: "bg-amber-300",
    surface:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50",
  },
  limited: {
    icon: "info",
    labelKey: "badge.limited" as const,
    longKey: "badge.limitedProcessing" as const,
    chipIcon: "bg-sky-400/25 text-sky-50 ring-sky-300/30",
    chipDot: "bg-sky-300",
    surface:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800/50",
  },
};

interface ProcessingBadgeProps {
  tier?: ProcessingTier;
  size?: "default" | "compact";
  /** Scales compact badge icon with bento card size (sm/md/lg). */
  compactTier?: "sm" | "md" | "lg";
  className?: string;
}

const COMPACT_ICON_BY_TIER = {
  sm: "!text-[14px]",
  md: "!text-[16px]",
  lg: "!text-[20px]",
} as const;

/** Standalone pill for headers, cards, and search. */
export default function ProcessingBadge({
  tier = "local",
  size = "default",
  compactTier,
  className,
}: ProcessingBadgeProps) {
  const { t } = useTranslation();
  const compact = size === "compact";
  const config = TIER_CONFIG[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center border font-semibold",
        compact
          ? cn(
              "gap-1 rounded-full leading-none",
              compactTier === "lg"
                ? "px-2.5 py-1 text-[11px]"
                : compactTier === "md"
                  ? "px-2 py-0.5 text-[10px]"
                  : "px-2 py-0.5 text-[10px]"
            )
          : "gap-1.5 rounded-full px-3 py-1 text-xs",
        config.surface,
        className
      )}
    >
      <span
        className={cn(
          "material-symbols-outlined icon-filled shrink-0 leading-none",
          compact
            ? compactTier
              ? COMPACT_ICON_BY_TIER[compactTier]
              : "text-[12px]"
            : "text-[14px]"
        )}
      >
        {config.icon}
      </span>
      {t(compact ? config.labelKey : config.longKey)}
    </span>
  );
}

interface ProcessingChipProps {
  tier?: ProcessingTier;
  className?: string;
}

/** Shared 20px frosted orb — must match `.btn-icon-orb` in globals.css */
export const BTN_ICON_ORB =
  "btn-icon-orb ring-1 ring-inset ring-white/20 bg-white/14 text-white";

/** Frosted trust seal used inside primary action buttons. */
export function ProcessingChip({ tier = "local", className }: ProcessingChipProps) {
  const { t } = useTranslation();
  const config = TIER_CONFIG[tier];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 py-0.5 pl-0.5 pr-2",
        "ring-1 ring-inset ring-white/20",
        className
      )}
    >
      <span className={cn("relative", BTN_ICON_ORB, config.chipIcon)}>
        <span className="material-symbols-outlined btn-icon-glyph">{config.icon}</span>
        <span
          className={cn(
            "absolute -bottom-px -right-px h-1 w-1 rounded-full ring-[1.5px] ring-teal-600",
            config.chipDot
          )}
          aria-hidden
        />
      </span>
      <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-white/90 leading-none">
        {t(config.labelKey)}
      </span>
    </span>
  );
}

export function ProcessingDivider({ className }: { className?: string }) {
  return (
    <span
      className={cn("mx-2 h-4 w-px shrink-0 bg-white/25", className)}
      aria-hidden
    />
  );
}
