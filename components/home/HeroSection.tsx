"use client";

import { cn } from "@/lib/utils";
import HeroAccentLine from "@/components/home/HeroAccentLine";

interface HeroSectionProps {
  t: (key: string) => string;
}

export default function HeroSection({ t }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pb-12 sm:pb-16 -mt-[var(--app-header-total)] pt-[calc(var(--app-header-total)+3.5rem)] sm:mt-0 sm:pt-28 sm:pb-16">
      <div className="absolute inset-x-0 top-[calc(-1*var(--app-header-total))] bottom-0 bg-gradient-to-b from-teal-50/50 dark:from-teal-950/30 to-transparent -z-10" />
      <div className="absolute top-[calc(20%-var(--app-header-total))] left-1/2 -translate-x-1/2 w-[min(720px,92vw)] h-[320px] bg-[#1461bd]/8 dark:bg-teal-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 text-center">
        <div className="animate-fade-in-up mb-5 sm:mb-6 flex justify-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700/70 bg-white/85 dark:bg-slate-900/85 px-3.5 py-1.5 text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm backdrop-blur-sm">
            <span className="material-symbols-outlined !text-[15px] text-[#1461bd] dark:text-teal-400">
              verified_user
            </span>
            {t("home.hero.badge")}
          </p>
        </div>

        <h1 className="animate-fade-in-up text-[2rem] leading-[1.12] sm:text-5xl sm:leading-[1.1] lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto text-balance">
          <span className="block text-slate-900 dark:text-slate-100">{t("home.hero.titleLead")}</span>
          <span className="block mt-1.5 sm:mt-2">
            <HeroAccentLine t={t} />
          </span>
        </h1>

        <p
          className={cn(
            "animate-fade-in-up mt-5 sm:mt-6 text-sm sm:text-base lg:text-[1.0625rem]",
            "text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed text-pretty"
          )}
        >
          {t("home.hero.subtitle")}
        </p>

        <div className="animate-fade-in-up mt-7 sm:mt-8 flex flex-col items-center gap-3">
          <a
            href="#tools"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all",
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
  );
}
