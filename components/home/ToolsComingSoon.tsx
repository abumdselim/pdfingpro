"use client";

import { cn } from "@/lib/utils";

interface ToolsComingSoonProps {
  t: (key: string) => string;
}

const TEASERS = [
  { icon: "document_scanner", labelKey: "home.comingSoon.item.searchableOcr" },
  { icon: "auto_awesome", labelKey: "home.comingSoon.item.aiSummary" },
  { icon: "api", labelKey: "home.comingSoon.item.apiAccess" },
  { icon: "cloud_sync", labelKey: "home.comingSoon.item.batchCloud" },
] as const;

export default function ToolsComingSoon({ t }: ToolsComingSoonProps) {
  return (
    <section
      aria-labelledby="coming-soon-heading"
      className="border-t border-slate-200/70 dark:border-slate-800/70"
    >
      <div className="max-w-6xl mx-auto px-6 py-14 sm:py-16">
        <div
          className={cn(
            "relative overflow-hidden rounded-xl",
            "bg-[#1461bd] dark:bg-[#1461bd]",
            "shadow-md shadow-[#1461bd]/20",
            "px-6 py-9 sm:px-10 sm:py-11 lg:px-12 lg:py-12"
          )}
        >
          <div className="relative max-w-2xl mx-auto text-center">
            <p className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 mb-5">
              <span className="material-symbols-outlined text-[14px] text-white/80">
                schedule
              </span>
              {t("home.comingSoon.badge")}
            </p>

            <h2
              id="coming-soon-heading"
              className="text-xl sm:text-2xl lg:text-[1.75rem] font-semibold tracking-tight text-white"
            >
              {t("home.comingSoon.title")}
            </h2>

            <p className="mt-3 text-sm text-white/80 leading-relaxed">
              {t("home.comingSoon.subtitle")}
            </p>
          </div>

          <ul className="relative mt-9 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {TEASERS.map(({ icon, labelKey }) => (
              <li
                key={labelKey}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-lg bg-white",
                  "p-4 sm:p-5 text-center shadow-sm"
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1461bd]/10 text-[#1461bd]">
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </span>
                <p className="text-xs sm:text-sm font-medium text-[#1461bd] leading-snug">
                  {t(labelKey)}
                </p>
                <span className="inline-flex items-center rounded-md bg-[#1461bd]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#1461bd]">
                  {t("home.comingSoon.soonLabel")}
                </span>
              </li>
            ))}
          </ul>

          <p className="relative mt-8 text-center text-xs text-white/70">
            {t("home.comingSoon.footer")}
          </p>
        </div>
      </div>
    </section>
  );
}
