"use client";

import { useState } from "react";
import { TOOLS, CATEGORIES, type ToolCategory } from "@/lib/tools";
import { getBentoSize, getBentoSpan } from "@/lib/home-bento";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import ToolBentoCard from "@/components/home/ToolBentoCard";
import CategoryFilter from "@/components/home/CategoryFilter";
import ToolsComingSoon from "@/components/home/ToolsComingSoon";

const CATEGORY_ORDER: ToolCategory[] = ["organize", "convert", "edit", "security"];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");
  const { t } = useTranslation();

  const filtered =
    activeCategory === "all"
      ? TOOLS
      : TOOLS.filter((tool) => tool.category === activeCategory);

  const isGroupedAll = activeCategory === "all";

  const renderToolGrid = (tools: typeof TOOLS, useBento: boolean) => (
    <div
      className={cn(
        "grid gap-3 sm:gap-4",
        useBento
          ? "grid-flow-dense grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[minmax(6.5rem,auto)]"
          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      )}
    >
      {tools.map((tool) => (
        <ToolBentoCard
          key={tool.id}
          tool={tool}
          title={t(tool.titleKey)}
          size={getBentoSize(tool.id, useBento ? "all" : activeCategory)}
          className={getBentoSpan(tool.id, useBento ? "all" : activeCategory)}
        />
      ))}
    </div>
  );

  return (
    <main>
      <section className="relative overflow-hidden pb-12 sm:pb-14 -mt-[var(--app-header-total)] pt-[calc(var(--app-header-total)+4.5rem)] sm:mt-0 sm:pt-28 sm:pb-14">
        <div className="absolute inset-x-0 top-[calc(-1*var(--app-header-total))] bottom-0 bg-gradient-to-b from-teal-50/50 dark:from-teal-950/30 to-transparent -z-10" />
        <div className="absolute top-[calc(25%-var(--app-header-total))] left-1/2 -translate-x-1/2 w-[min(720px,92vw)] h-[300px] bg-[#1461bd]/8 dark:bg-teal-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="animate-fade-in-up inline-flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1461bd] dark:bg-teal-400 animate-pulse shrink-0" />
            {t("home.hero.badge")}
          </div>

          <h1 className="animate-fade-in-up text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600 dark:from-slate-100 dark:via-slate-200 dark:to-slate-400 tracking-tight leading-[1.08] max-w-4xl mx-auto">
            {t("home.hero.title")}
          </h1>

          <p className="animate-fade-in-up mt-5 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t("home.hero.subtitle")}
          </p>

          <div className="animate-fade-in-up mt-8">
            <a
              href="#tools"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
                "bg-[#1461bd] text-white shadow-sm shadow-[#1461bd]/25",
                "hover:bg-[#1254a8] hover:shadow-md hover:-translate-y-px",
                "dark:bg-teal-600 dark:shadow-teal-600/25 dark:hover:bg-teal-500"
              )}
            >
              {t("home.hero.browseTools")}
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </a>
          </div>
        </div>
      </section>

      <section id="tools" className="max-w-6xl mx-auto px-6 pb-20 scroll-mt-20">
        <div className="mb-6 hidden md:block">
          <CategoryFilter active={activeCategory} onChange={setActiveCategory} label={t} />
        </div>

        {isGroupedAll ? (
          <div className="space-y-10">
            {CATEGORY_ORDER.map((cat) => {
              const catTools = TOOLS.filter((tool) => tool.category === cat);
              const catLabel = CATEGORIES.find((c) => c.id === cat);
              if (!catTools.length || !catLabel) return null;
              return (
                <div key={cat}>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                    {t(catLabel.labelKey)}
                  </h2>
                  {renderToolGrid(catTools, true)}
                </div>
              );
            })}
          </div>
        ) : (
          renderToolGrid(filtered, false)
        )}
      </section>

      <ToolsComingSoon t={t} />
    </main>
  );
}
