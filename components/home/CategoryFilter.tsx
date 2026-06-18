"use client";

import { cn } from "@/lib/utils";
import { CATEGORIES, type ToolCategory } from "@/lib/tools";

interface CategoryFilterProps {
  active: ToolCategory | "all";
  onChange: (cat: ToolCategory | "all") => void;
  label: (key: string) => string;
}

export default function CategoryFilter({ active, onChange, label }: CategoryFilterProps) {
  return (
    <div className="pb-1">
      <div
        className="flex flex-wrap justify-center gap-1 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-800/60 shadow-sm"
        role="tablist"
        aria-label="Tool categories"
      >
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(cat.id)}
              className={cn(
                "px-3.5 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shrink-0 whitespace-nowrap",
                isActive
                  ? "bg-[#1461bd] text-white shadow-sm shadow-[#1461bd]/25"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/90 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              {label(cat.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
