"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TOOLS, CATEGORIES, type Tool } from "@/lib/tools";
import { cn } from "@/lib/utils";

interface ToolSearchProps {
  t: (key: string) => string;
}

function normalizeQuery(value: string) {
  return value.toLowerCase().trim();
}

function toolMatches(tool: Tool, query: string, t: (key: string) => string) {
  if (!query) return true;
  const q = normalizeQuery(query);
  return (
    normalizeQuery(t(tool.titleKey)).includes(q) ||
    normalizeQuery(t(tool.descriptionKey)).includes(q) ||
    tool.id.includes(q.replace(/\s+/g, "-"))
  );
}

export default function ToolSearch({ t }: ToolSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(frame);
    };
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return TOOLS.slice(0, 8);
    return TOOLS.filter((tool) => toolMatches(tool, query, t));
  }, [query, t]);

  const categoryLabel = (category: Tool["category"]) => {
    const cat = CATEGORIES.find((c) => c.id === category);
    return cat ? t(cat.labelKey) : category;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-1.5 border-l border-slate-200/70 dark:border-slate-700/70",
          "px-2.5 sm:px-3 text-slate-600 dark:text-slate-300",
          "hover:text-[#1461bd] dark:hover:text-teal-400 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
        )}
        aria-label={t("header.searchTools")}
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

      {open && (
        <div className="fixed inset-0 z-[70]" role="presentation">
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
              <span className="material-symbols-outlined text-[20px] text-[#1461bd] dark:text-teal-400">search</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("header.searchPlaceholder")}
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

            <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {query.trim()
                ? t("header.searchResults").replace("{count}", String(results.length))
                : t("header.searchHint").replace("{count}", String(TOOLS.length))}
            </p>

            <ul className="max-h-[min(22rem,50vh)] overflow-y-auto touch-scroll px-2 py-2">
              {results.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t("header.searchNoResults")}
                </li>
              ) : (
                results.map((tool) => (
                  <li key={tool.id}>
                    <Link
                      href={tool.href}
                      onClick={close}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                        "hover:bg-slate-50 dark:hover:bg-slate-800/80"
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
                        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {t(tool.titleKey)}
                        </span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                          {t(tool.descriptionKey)}
                        </span>
                      </span>
                      <span className="hidden sm:block shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {categoryLabel(tool.category)}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
