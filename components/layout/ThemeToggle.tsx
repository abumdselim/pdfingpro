"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  /** Renders flush inside the header nav segment group (no outer chrome). */
  segmented?: boolean;
}

export default function ThemeToggle({ segmented = false }: ThemeToggleProps) {
  const { resolved, toggle } = useTheme();
  const { t } = useTranslation();
  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
      onClick={toggle}
      className={cn(
        "relative inline-flex h-9 w-12 shrink-0 cursor-pointer items-center p-1 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1461bd]/40",
        segmented
          ? "rounded-none bg-transparent"
          : cn(
              "rounded-full border border-slate-200/80 dark:border-slate-700/80 shadow-sm active:scale-[0.97]",
              isDark ? "bg-slate-800/80" : "bg-slate-100/90"
            )
      )}
    >
      <span
        className={cn(
          "relative flex h-full w-full items-center rounded-full transition-colors duration-200",
          segmented
            ? isDark
              ? "bg-slate-700/60"
              : "bg-slate-200/70 dark:bg-slate-700/40"
            : isDark
              ? "bg-slate-700/50"
              : "bg-slate-300/40"
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full",
            "bg-white shadow-sm ring-1 ring-black/[0.06] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "dark:bg-slate-100 dark:ring-white/10",
            isDark ? "translate-x-3" : "translate-x-0"
          )}
          aria-hidden
        >
          <span
            className={cn(
              "material-symbols-outlined !text-[16px]",
              isDark ? "text-slate-600" : "text-[#1461bd]"
            )}
          >
            {isDark ? "dark_mode" : "light_mode"}
          </span>
        </span>
      </span>
    </button>
  );
}
