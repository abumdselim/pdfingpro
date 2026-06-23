"use client";

import { useState } from "react";
import { TOOLS, CATEGORIES, type ToolCategory } from "@/lib/tools";
import { getBentoSize, getBentoSpan } from "@/lib/home-bento";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import ToolBentoCard from "@/components/home/ToolBentoCard";
import CategoryFilter from "@/components/home/CategoryFilter";
import HeroSection from "@/components/home/HeroSection";
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
          ? "grid-flow-dense grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[minmax(7.75rem,auto)] sm:auto-rows-[minmax(8.25rem,auto)]"
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
      <HeroSection t={t} />

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
