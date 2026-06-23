"use client";

import { useRouter } from "next/navigation";
import {
  SEARCH_QUICK_ACTIONS,
  SUGGESTED_SEARCH_QUERIES,
  splitByHighlight,
  type HighlightPart,
  type SearchQuickAction,
} from "@/lib/tool-search";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { cn } from "@/lib/utils";

export function SearchHighlight({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className?: string;
}) {
  const parts = splitByHighlight(text, query);
  return (
    <span className={className}>
      {parts.map((part: HighlightPart, index) =>
        part.match ? (
          <mark
            key={index}
            className="rounded-sm bg-[#1461bd]/15 text-[#1461bd] dark:bg-teal-500/20 dark:text-teal-300 font-semibold"
          >
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </span>
  );
}

export function SearchSuggestionChips({
  t,
  onSelect,
  className,
}: {
  t: (key: string) => string;
  onSelect: (query: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {t("header.searchSuggestions")}
      </p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_SEARCH_QUERIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className="rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SearchRecentQueries({
  queries,
  t,
  onSelect,
  className,
}: {
  queries: string[];
  t: (key: string) => string;
  onSelect: (query: string) => void;
  className?: string;
}) {
  if (queries.length === 0) return null;

  return (
    <div className={className}>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {t("header.searchRecentQueries")}
      </p>
      <div className="flex flex-wrap gap-2">
        {queries.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            <span className="material-symbols-outlined !text-[14px]">history</span>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SearchQuickActions({
  t,
  onNavigate,
  compact = false,
}: {
  t: (key: string) => string;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const { toggle, resolved } = useTheme();

  const handleAction = (action: SearchQuickAction) => {
    if (action.action === "theme") {
      toggle();
      onNavigate?.();
      return;
    }
    if (action.href) {
      onNavigate?.();
      router.push(action.href);
    }
  };

  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {t("header.searchQuickActions")}
      </p>
      <ul className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-1")}>
        {SEARCH_QUICK_ACTIONS.map((action) => {
          const label =
            action.id === "theme"
              ? resolved === "dark"
                ? t("theme.switchToLight")
                : t("theme.switchToDark")
              : t(action.labelKey);

          return (
            <li key={action.id}>
              <button
                type="button"
                onClick={() => handleAction(action)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80",
                  "bg-white dark:bg-slate-900 px-3 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200",
                  "hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.99] transition-transform"
                )}
              >
                <span className="material-symbols-outlined !text-[18px] text-[#1461bd] dark:text-teal-400">
                  {action.id === "theme" && resolved === "dark" ? "light_mode" : action.icon}
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SearchEndMarker({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 pt-6 pb-2" aria-hidden="true">
      <span className="h-px flex-1 max-w-[4rem] bg-slate-200 dark:bg-slate-700" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <span className="h-px flex-1 max-w-[4rem] bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}
