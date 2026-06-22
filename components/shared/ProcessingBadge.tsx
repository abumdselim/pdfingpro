"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export type ProcessingTier = "local" | "server" | "limited";

interface ProcessingBadgeProps {
  tier?: ProcessingTier;
  className?: string;
}

export default function ProcessingBadge({ tier = "local", className }: ProcessingBadgeProps) {
  const { t } = useTranslation();

  const config = {
    local: {
      icon: "shield",
      label: t("badge.localProcessing"),
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50",
    },
    server: {
      icon: "cloud",
      label: t("badge.serverProcessing"),
      classes: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50",
    },
    limited: {
      icon: "info",
      label: t("badge.limitedProcessing"),
      classes: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800/50",
    },
  }[tier];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        config.classes,
        className
      )}
    >
      <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
      {config.label}
    </div>
  );
}
