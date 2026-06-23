"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  TOOLS,
  type Tool,
  type ToolCategory,
} from "@/lib/tools";
import {
  getRecentSearches,
  getRecentTools,
  rememberRecentSearch,
  searchTools,
} from "@/lib/tool-search";
import { useVisualViewport } from "@/lib/hooks/use-visual-viewport";
import {
  SearchEndMarker,
  SearchHighlight,
  SearchQuickActions,
  SearchRecentQueries,
  SearchSuggestionChips,
} from "@/components/search/SearchExtras";
import { cn } from "@/lib/utils";

interface ToolSearchMobileProps {
  t: (key: string) => string;
  open: boolean;
  onClose: () => void;
  onNavigate: (tool: Tool) => void;
}

export default function ToolSearchMobile({ t, open, onClose, onNavigate }: ToolSearchMobileProps) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ToolCategory | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewport = useVisualViewport(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setRecentSearches(getRecentSearches());
  }, [open]);

  const close = useCallback(() => {
    setQuery("");
    setCategoryFilter(null);
    onClose();
  }, [onClose]);

  const applyQuery = useCallback((value: string) => {
    setQuery(value);
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const handleSelect = useCallback(
    (tool: Tool) => {
      if (query.trim()) rememberRecentSearch(query);
      onNavigate(tool);
    },
    [onNavigate, query]
  );

  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));

    return () => {
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      cancelAnimationFrame(frame);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [query, categoryFilter]);

  const recentTools = useMemo(() => (open ? getRecentTools(t) : []), [open, t]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchTools(query, t, { category: categoryFilter });
  }, [query, t, categoryFilter]);

  const categoryResults = useMemo(() => {
    if (!categoryFilter || query.trim()) return [];
    return TOOLS.filter((tool) => tool.category === categoryFilter);
  }, [categoryFilter, query]);

  const isFiltering = Boolean(query.trim() || categoryFilter);
  const activeResults = query.trim() ? searchResults : categoryResults;
  const showEndMarker = !isFiltering || activeResults.length > 0;

  const keyboardInset =
    viewport.height && typeof window !== "undefined"
      ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      : 0;

  const panelHeight =
    viewport.height && typeof window !== "undefined" ? `${viewport.height}px` : undefined;

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-x-0 top-0 z-[100] flex md:hidden w-full flex-col overflow-hidden bg-[#f1f5f9] dark:bg-slate-950"
      style={{ height: panelHeight ?? "100dvh", maxHeight: panelHeight ?? "100dvh" }}
      role="dialog"
      aria-modal="true"
      aria-label={t("header.searchTools")}
    >
      <div className="shrink-0 border-b border-slate-200/60 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 pt-[var(--app-safe-top)]">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"
            aria-label={t("header.closeSearch")}
          >
            <span className="material-symbols-outlined !text-[20px]">close</span>
          </button>
          <h2 className="flex-1 text-center text-[15px] font-semibold text-slate-800 dark:text-slate-100 pr-10">
            {t("header.searchTitle")}
          </h2>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-y-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="sticky top-0 z-10 bg-[#f1f5f9]/95 dark:bg-slate-950/95 backdrop-blur-md px-4 pt-3 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm">
            <span className="material-symbols-outlined !text-[20px] text-[#1461bd] dark:text-teal-400 shrink-0">
              search
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("header.searchPlaceholder")}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode="search"
              enterKeyHint="search"
              type="search"
              className="flex-1 min-w-0 bg-transparent text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                aria-label={t("common.clear")}
              >
                <span className="material-symbols-outlined !text-[16px]">close</span>
              </button>
            )}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto touch-scroll -mx-1 px-1 pb-0.5">
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
              const active = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(active ? null : (cat.id as ToolCategory))}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-all active:scale-95",
                    active
                      ? "bg-[#1461bd] text-white shadow-sm dark:bg-teal-600"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80"
                  )}
                >
                  {t(cat.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="px-4 pt-4"
          style={{
            paddingBottom: `calc(2rem + var(--app-safe-bottom) + ${keyboardInset}px)`,
          }}
        >
          {isFiltering ? (
            <MobileResultSection
              title={
                query.trim()
                  ? t("header.searchResults").replace("{count}", String(activeResults.length))
                  : t(CATEGORIES.find((c) => c.id === categoryFilter)?.labelKey ?? "categories.all")
              }
              tools={activeResults}
              t={t}
              query={query}
              onSelect={handleSelect}
              emptyMessage={t("header.searchNoResults")}
            />
          ) : (
            <div className="space-y-6">
              <SearchSuggestionChips t={t} onSelect={applyQuery} />
              <SearchRecentQueries
                queries={recentSearches}
                t={t}
                onSelect={applyQuery}
              />
              {recentTools.length > 0 && (
                <MobileResultSection
                  title={t("header.searchRecent")}
                  tools={recentTools}
                  t={t}
                  onSelect={handleSelect}
                />
              )}
              {CATEGORY_ORDER.map((category) => {
                const catMeta = CATEGORIES.find((c) => c.id === category);
                const tools = TOOLS.filter((tool) => tool.category === category);
                if (!catMeta || tools.length === 0) return null;
                return (
                  <MobileResultSection
                    key={category}
                    title={t(catMeta.labelKey)}
                    tools={tools}
                    t={t}
                    onSelect={handleSelect}
                  />
                );
              })}
              <SearchQuickActions t={t} onNavigate={close} compact />
            </div>
          )}

          {showEndMarker && <SearchEndMarker label={t("header.searchEnd")} />}
        </div>
      </div>
    </div>,
    document.body
  );
}

function MobileResultSection({
  title,
  tools,
  t,
  query = "",
  onSelect,
  emptyMessage,
}: {
  title: string;
  tools: Tool[];
  t: (key: string) => string;
  query?: string;
  onSelect: (tool: Tool) => void;
  emptyMessage?: string;
}) {
  if (tools.length === 0 && emptyMessage) {
    return (
      <div>
        <SectionLabel title={title} />
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-4 py-10 text-center">
          <span className="material-symbols-outlined !text-[32px] text-slate-300 dark:text-slate-600 mb-2 block">
            search_off
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  if (tools.length === 0) return null;

  return (
    <section>
      <SectionLabel title={`${title} · ${tools.length}`} />
      <ul className="space-y-2">
        {tools.map((tool) => (
          <li key={tool.id}>
            <MobileResultCard tool={tool} t={t} query={query} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
      {title}
    </p>
  );
}

function MobileResultCard({
  tool,
  t,
  query,
  onSelect,
}: {
  tool: Tool;
  t: (key: string) => string;
  query?: string;
  onSelect: (tool: Tool) => void;
}) {
  const title = t(tool.titleKey);
  const description = t(tool.descriptionKey);

  return (
    <Link
      href={tool.href}
      onClick={(event) => {
        event.preventDefault();
        onSelect(tool);
      }}
      className={cn(
        "group flex items-center gap-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80",
        "bg-white dark:bg-slate-900 px-3.5 py-3.5 shadow-sm",
        "active:scale-[0.99] transition-transform"
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          tool.color
        )}
      >
        <span className="material-symbols-outlined text-[22px]">{tool.icon}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-slate-800 dark:text-slate-100 leading-tight">
          {query ? <SearchHighlight text={title} query={query} /> : title}
        </span>
        <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
          {query ? <SearchHighlight text={description} query={query} /> : description}
        </span>
      </span>
      <span className="material-symbols-outlined shrink-0 !text-[20px] text-slate-300 dark:text-slate-600 group-active:text-[#1461bd] dark:group-active:text-teal-400">
        arrow_forward
      </span>
    </Link>
  );
}
