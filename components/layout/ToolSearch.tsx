"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CATEGORIES, TOOLS, type Tool } from "@/lib/tools";
import {
  getDefaultSearchResults,
  getRecentSearches,
  getRecentToolIds,
  isEditableTarget,
  rememberRecentSearch,
  rememberRecentTool,
  searchTools,
} from "@/lib/tool-search";
import { cn } from "@/lib/utils";
import ProcessingBadge from "@/components/shared/ProcessingBadge";
import { getToolProcessingTier } from "@/lib/tool-processing";
import ToolSearchMobile from "@/components/layout/ToolSearchMobile";
import {
  SearchEndMarker,
  SearchHighlight,
  SearchQuickActions,
  SearchRecentQueries,
  SearchSuggestionChips,
} from "@/components/search/SearchExtras";

interface ToolSearchProps {
  t: (key: string) => string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ToolSearch({ t, open: openProp, onOpenChange }: ToolSearchProps) {
  const router = useRouter();
  const [openInternal, setOpenInternal] = useState(false);
  const open = openProp ?? openInternal;
  const setOpen = onOpenChange ?? setOpenInternal;

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setRecentSearches(getRecentSearches());
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, [setOpen]);

  const openSearch = useCallback(() => {
    setOpen(true);
    setActiveIndex(0);
  }, [setOpen]);

  const applyQuery = useCallback((value: string) => {
    setQuery(value);
    setActiveIndex(0);
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const navigateTo = useCallback(
    (tool: Tool) => {
      rememberRecentTool(tool.id);
      if (query.trim()) rememberRecentSearch(query);
      close();
      router.push(tool.href);
    },
    [close, query, router]
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!window.matchMedia("(min-width: 768px)").matches) return;

      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        setOpen(!open);
        return;
      }

      if (key === "/" && !isEditableTarget(event.target) && !open) {
        event.preventDefault();
        openSearch();
        return;
      }

      if (key === "escape" && open) {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open, openSearch, setOpen]);

  useEffect(() => {
    if (!open || !window.matchMedia("(min-width: 768px)").matches) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const frame = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      cancelAnimationFrame(frame);
    };
  }, [open]);

  const hasQuery = Boolean(query.trim());

  const results = useMemo(() => {
    if (!hasQuery) return getDefaultSearchResults(t, 8);
    return searchTools(query, t);
  }, [hasQuery, query, t]);

  const emptyLabel = useMemo(() => {
    if (getRecentToolIds().length > 0) return t("header.searchRecent");
    return t("header.searchHint").replace("{count}", String(TOOLS.length));
  }, [t, open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const item = listRef.current.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      navigateTo(results[activeIndex]);
    }
  };

  const categoryLabel = (category: Tool["category"]) => {
    const cat = CATEGORIES.find((c) => c.id === category);
    return cat ? t(cat.labelKey) : category;
  };

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-1.5 border-l border-slate-200/70 dark:border-slate-700/70",
          "px-2.5 sm:px-3 text-slate-600 dark:text-slate-300",
          "hover:text-[#1461bd] dark:hover:text-teal-400 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors",
          "md:px-2.5"
        )}
        aria-label={t("header.searchTools")}
        aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
      >
        <span className="material-symbols-outlined !text-[18px]">search</span>
        <span className="hidden lg:inline text-sm font-medium">{t("header.searchTools")}</span>
        <kbd
          className={cn(
            "hidden md:inline-flex items-center rounded border border-slate-200 dark:border-slate-600",
            "bg-slate-50 dark:bg-slate-700/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-400 ml-0.5"
          )}
        >
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      {open && mounted && (
        <>
          <ToolSearchMobile open={open} onClose={close} onNavigate={navigateTo} t={t} />
          {createPortal(
            <div className="fixed inset-0 z-[100] hidden md:block" role="presentation">
              <button
                type="button"
                className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] animate-fade-in"
                aria-label={t("common.cancel")}
                onClick={close}
              />

              <div
                role="dialog"
                aria-modal="true"
                aria-label={t("header.searchTools")}
                className={cn(
                  "absolute left-1/2 top-[max(1rem,10vh)] w-[min(32rem,calc(100vw-1.5rem))] -translate-x-1/2",
                  "overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/80",
                  "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-slate-900/15 animate-scale-in"
                )}
              >
                <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-700/80 px-4 py-3">
                  <span className="material-symbols-outlined text-[20px] text-[#1461bd] dark:text-teal-400">
                    search
                  </span>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onInputKeyDown}
                    placeholder={t("header.searchPlaceholder")}
                    aria-controls="tool-search-results"
                    aria-activedescendant={
                      results[activeIndex] ? `tool-search-${results[activeIndex].id}` : undefined
                    }
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="flex-1 bg-transparent text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    Esc
                  </button>
                </div>

                <div className="max-h-[min(28rem,58vh)] overflow-y-auto touch-scroll">
                  {!hasQuery && (
                    <div className="space-y-4 px-4 pt-4">
                      <SearchSuggestionChips t={t} onSelect={applyQuery} />
                      <SearchRecentQueries
                        queries={recentSearches}
                        t={t}
                        onSelect={applyQuery}
                      />
                    </div>
                  )}

                  <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {hasQuery
                      ? t("header.searchResults").replace("{count}", String(results.length))
                      : emptyLabel}
                  </p>

                  <ul
                    id="tool-search-results"
                    ref={listRef}
                    role="listbox"
                    aria-label={t("header.searchTools")}
                    className="px-2 py-2"
                  >
                    {results.length === 0 ? (
                      <li className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        {t("header.searchNoResults")}
                      </li>
                    ) : (
                      results.map((tool, index) => {
                        const title = t(tool.titleKey);
                        const description = t(tool.descriptionKey);

                        return (
                          <li key={tool.id} role="presentation">
                            <Link
                              id={`tool-search-${tool.id}`}
                              data-index={index}
                              href={tool.href}
                              role="option"
                              aria-selected={index === activeIndex}
                              onClick={(event) => {
                                event.preventDefault();
                                navigateTo(tool);
                              }}
                              onMouseEnter={() => setActiveIndex(index)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                                index === activeIndex
                                  ? "bg-[#1461bd]/10 dark:bg-teal-500/15 ring-1 ring-[#1461bd]/20 dark:ring-teal-500/25"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800/80"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                  tool.color
                                )}
                              >
                                <span className="material-symbols-outlined text-[20px]">{tool.icon}</span>
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2 min-w-0">
                                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                                    {hasQuery ? (
                                      <SearchHighlight text={title} query={query} />
                                    ) : (
                                      title
                                    )}
                                  </span>
                                  <ProcessingBadge tier={getToolProcessingTier(tool.id)} size="compact" />
                                </span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {hasQuery ? (
                                    <SearchHighlight text={description} query={query} />
                                  ) : (
                                    description
                                  )}
                                </span>
                              </span>
                              <span className="hidden sm:block shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                {categoryLabel(tool.category)}
                              </span>
                            </Link>
                          </li>
                        );
                      })
                    )}
                  </ul>

                  {!hasQuery && (
                    <div className="px-4 pb-2">
                      <SearchQuickActions t={t} onNavigate={close} />
                    </div>
                  )}

                  {(hasQuery ? results.length > 0 : true) && (
                    <div className="px-4">
                      <SearchEndMarker label={t("header.searchEnd")} />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-200/80 dark:border-slate-700/80 px-4 py-2.5 text-[10px] text-slate-400 dark:text-slate-500">
                  <span>{t("header.searchShortcutNavigate")}</span>
                  <span>{t("header.searchShortcutOpen")}</span>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </>
  );
}
