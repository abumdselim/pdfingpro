"use client";

import { cn } from "@/lib/utils";

interface ToolsComingSoonProps {
  t: (key: string) => string;
}

const TEASERS = [
  { icon: "layers_clear", labelKey: "home.comingSoon.item.flatten", tone: "teal" },
  { icon: "filter_none", labelKey: "home.comingSoon.item.blankPages", tone: "blue" },
  { icon: "bookmark_add", labelKey: "home.comingSoon.item.bookmarks", tone: "violet" },
  { icon: "account_tree", labelKey: "home.comingSoon.item.workflows", tone: "amber" },
] as const;

const toneStyles: Record<(typeof TEASERS)[number]["tone"], string> = {
  teal: "bg-teal-500/10 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300 border-teal-200/60 dark:border-teal-700/50",
  blue: "bg-[#1461bd]/10 text-[#1461bd] dark:bg-blue-500/15 dark:text-blue-300 border-blue-200/60 dark:border-blue-700/50",
  violet: "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 border-violet-200/60 dark:border-violet-700/50",
  amber: "bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200/60 dark:border-amber-700/50",
};

export default function ToolsComingSoon({ t }: ToolsComingSoonProps) {
  return (
    <section
      aria-labelledby="coming-soon-heading"
      className="border-t border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-slate-50/80 to-transparent dark:from-slate-900/50"
    >
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700/80",
            "bg-gradient-to-br from-white via-teal-50/40 to-[#1461bd]/5",
            "dark:from-slate-900 dark:via-slate-800/90 dark:to-teal-950/30",
            "shadow-[0_24px_80px_-24px_rgba(20,97,189,0.18)] dark:shadow-[0_24px_80px_-24px_rgba(0,0,0,0.45)]",
            "px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14"
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[#1461bd]/10 blur-3xl dark:bg-teal-500/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-teal-400/15 blur-3xl dark:bg-teal-600/10"
          />

          <div className="relative text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1461bd]/20 dark:border-teal-500/30 bg-white/80 dark:bg-slate-800/80 px-3.5 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#1461bd] dark:text-teal-400 shadow-sm mb-5">
              <span className="material-symbols-outlined text-[16px] animate-pulse">auto_awesome</span>
              {t("home.comingSoon.badge")}
            </div>

            <h2
              id="coming-soon-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#1461bd] to-teal-700 dark:from-slate-100 dark:via-teal-300 dark:to-teal-500"
            >
              {t("home.comingSoon.title")}
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("home.comingSoon.subtitle")}
            </p>
          </div>

          <ul className="relative mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {TEASERS.map(({ icon, labelKey, tone }, index) => (
              <li
                key={labelKey}
                className={cn(
                  "group relative flex flex-col items-center gap-3 rounded-2xl border p-4 sm:p-5 text-center transition-all duration-300",
                  "bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm",
                  "hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#1461bd]/10 dark:hover:shadow-black/30",
                  toneStyles[tone]
                )}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105",
                    toneStyles[tone]
                  )}
                >
                  <span className="material-symbols-outlined text-[22px]">{icon}</span>
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                  {t(labelKey)}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 dark:bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span className="h-1 w-1 rounded-full bg-[#1461bd] dark:bg-teal-400 animate-pulse" />
                  {t("home.comingSoon.soonLabel")}
                </span>
              </li>
            ))}
          </ul>

          <p className="relative mt-8 text-center text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("home.comingSoon.footer")}
          </p>
        </div>
      </div>
    </section>
  );
}
