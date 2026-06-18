"use client";

import Link from "next/link";
import { useState } from "react";
import { TOOLS, CATEGORIES, type ToolCategory } from "@/lib/tools";
import { getBentoSize, getBentoSpan, QUICK_TOOLS } from "@/lib/home-bento";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import ToolBentoCard from "@/components/home/ToolBentoCard";
import CategoryFilter from "@/components/home/CategoryFilter";
import PrivacyBento from "@/components/home/PrivacyBento";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");
  const { t } = useTranslation();

  const filtered =
    activeCategory === "all"
      ? TOOLS
      : TOOLS.filter((tool) => tool.category === activeCategory);

  const isBento = activeCategory === "all";
  const activeLabel =
    activeCategory === "all"
      ? t("categories.all")
      : t(CATEGORIES.find((c) => c.id === activeCategory)?.labelKey ?? "categories.all");

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-14">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/50 dark:from-teal-950/30 to-transparent -z-10" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[min(720px,92vw)] h-[300px] bg-[#1461bd]/8 dark:bg-teal-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

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

          <div className="animate-fade-in-up mt-8 flex flex-wrap justify-center gap-2">
            {QUICK_TOOLS.map((id) => {
              const tool = TOOLS.find((x) => x.id === id);
              if (!tool) return null;
              return (
                <Link
                  key={id}
                  href={tool.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all",
                    "border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm",
                    "text-slate-700 dark:text-slate-200 hover:border-[#1461bd]/40 dark:hover:border-teal-500/40",
                    "hover:shadow-sm hover:-translate-y-px hover:text-[#1461bd] dark:hover:text-teal-400"
                  )}
                >
                  <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", tool.color)}>
                    <span className="material-symbols-outlined text-[16px]">{tool.icon}</span>
                  </span>
                  {t(tool.titleKey)}
                </Link>
              );
            })}
          </div>

          <div className="animate-fade-in-up mt-6">
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

      {/* Tools bento */}
      <section id="tools" className="max-w-6xl mx-auto px-6 pb-20 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {t("home.bento.toolsTitle")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("home.bento.toolsSubtitle", { count: filtered.length, category: activeLabel })}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <CategoryFilter active={activeCategory} onChange={setActiveCategory} label={t} />
        </div>

        <div
          className={cn(
            "grid gap-3 sm:gap-4",
            isBento
              ? "grid-flow-dense grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[minmax(7rem,auto)]"
              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          )}
        >
          {filtered.map((tool) => (
            <ToolBentoCard
              key={tool.id}
              tool={tool}
              title={t(tool.titleKey)}
              description={t(tool.descriptionKey)}
              openLabel={t("home.bento.openTool")}
              size={getBentoSize(tool.id, activeCategory)}
              className={getBentoSpan(tool.id, activeCategory)}
            />
          ))}
        </div>
      </section>

      <PrivacyBento t={t} />
    </main>
  );
}
