"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { ui, withDarkIcon } from "@/lib/theme/ui";
import ProcessingBadge from "@/components/shared/ProcessingBadge";
import { CATEGORY_ORDER, TOOLS, type ToolCategory } from "@/lib/tools";
import { getToolProcessingTier, type ProcessingTier } from "@/lib/tool-processing";

const TIER_ORDER: ProcessingTier[] = ["local", "limited", "server"];

const TIER_INTRO_KEYS: Record<ProcessingTier, string> = {
  local: "whatWorks.tiers.localIntro",
  limited: "whatWorks.tiers.limitedIntro",
  server: "whatWorks.tiers.serverIntro",
};

export default function WhatWorksPageContent() {
  const { t } = useTranslation();

  const byCategory = (category: ToolCategory) =>
    TOOLS.filter((tool) => tool.category === category);

  return (
    <div className="min-h-screen pt-[var(--app-header-total)] md:pt-14 pb-20">
      <div className="max-w-4xl mx-auto px-6 py-10 sm:py-12">
        <Link href="/" className={cn(ui.backLink, "mb-8")}>
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          {t("common.allTools")}
        </Link>

        <div className="text-center mb-10 animate-fade-in-up">
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm",
              withDarkIcon("bg-blue-50 text-blue-600")
            )}
          >
            <span className="material-symbols-outlined text-[32px]">fact_check</span>
          </div>
          <h1 className={cn("text-3xl sm:text-4xl font-extrabold tracking-tight", ui.heading)}>
            {t("whatWorks.title")}
          </h1>
          <p className={cn("text-base sm:text-lg mt-3 max-w-2xl mx-auto leading-relaxed", ui.muted)}>
            {t("whatWorks.subtitle", { count: String(TOOLS.length) })}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-12">
          {TIER_ORDER.map((tier) => (
            <div key={tier} className="tool-panel rounded-xl p-4 text-center">
              <ProcessingBadge tier={tier} className="mx-auto" />
              <p className={cn("mt-3 text-xs leading-relaxed", ui.muted)}>
                {t(TIER_INTRO_KEYS[tier])}
              </p>
              <p className="mt-2 text-2xl font-bold text-[#1461bd] dark:text-teal-400 tabular-nums">
                {TOOLS.filter((tool) => getToolProcessingTier(tool.id) === tier).length}
              </p>
            </div>
          ))}
        </div>

        {CATEGORY_ORDER.map((category) => {
          const tools = byCategory(category);
          if (!tools.length) return null;

          return (
            <section key={category} className="mb-10">
              <h2 className={cn("text-lg font-bold mb-4", ui.subheading)}>
                {t(`categories.${category}`)}
              </h2>
              <ul className="space-y-2">
                {tools.map((tool) => {
                  const tier = getToolProcessingTier(tool.id);
                  return (
                    <li key={tool.id}>
                      <Link
                        href={tool.href}
                        className={cn(
                          "flex flex-wrap items-center gap-2 sm:gap-3 rounded-lg border px-4 py-3",
                          "bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                          ui.border
                        )}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#1461bd] dark:text-teal-400">
                          {tool.icon}
                        </span>
                        <span className={cn("text-sm font-semibold flex-1 min-w-0", ui.body)}>
                          {t(tool.titleKey)}
                        </span>
                        <ProcessingBadge tier={tier} size="compact" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
