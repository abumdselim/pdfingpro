"use client";

import { TOOLS } from "@/lib/tools";
import { useCountUp } from "@/lib/hooks/use-count-up";
import { cn } from "@/lib/utils";
import HeroAccentLine from "@/components/home/HeroAccentLine";

interface HeroSectionProps {
  t: (key: string) => string;
}

const TRUST_STATS: { key: "tools" | "privacy" | "free" | "speed"; icon: string }[] = [
  { key: "tools", icon: "bolt" },
  { key: "privacy", icon: "lock" },
  { key: "free", icon: "redeem" },
  { key: "speed", icon: "cloud_off" },
];

export default function HeroSection({ t }: HeroSectionProps) {
  const toolCount = useCountUp(TOOLS.length);

  const statValue = (key: (typeof TRUST_STATS)[number]["key"]) => {
    if (key === "tools") {
      return t("home.hero.statToolsValue").replace(
        "{count}",
        String(toolCount)
      );
    }
    return "✓";
  };

  const statLabel = (key: (typeof TRUST_STATS)[number]["key"]) => {
    switch (key) {
      case "tools":
        return t("home.hero.statToolsLabel");
      case "privacy":
        return t("home.hero.statPrivacyLabel");
      case "free":
        return t("home.hero.statFreeLabel");
      case "speed":
        return t("home.hero.statSpeedLabel");
    }
  };

  return (
    <section className="relative overflow-hidden pb-14 sm:pb-20 -mt-[var(--app-header-total)] pt-[calc(var(--app-header-total)+3.5rem)] sm:mt-0 sm:pt-32 sm:pb-24">
      {/* Base wash */}
      <div className="absolute inset-x-0 top-[calc(-1*var(--app-header-total))] bottom-0 bg-gradient-to-b from-teal-50/70 via-white/40 to-transparent dark:from-teal-950/40 dark:via-slate-950/30 dark:to-transparent -z-20" />

      {/* Animated aurora blobs — drift slowly behind the copy */}
      <div
        aria-hidden
        className="absolute top-[calc(8%-var(--app-header-total))] left-[8%] w-[min(520px,70vw)] h-[360px] rounded-full bg-[#1461bd]/15 dark:bg-teal-500/10 blur-[120px] -z-10 animate-aurora"
      />
      <div
        aria-hidden
        className="absolute top-[calc(22%-var(--app-header-total))] right-[6%] w-[min(420px,60vw)] h-[320px] rounded-full bg-amber-400/15 dark:bg-amber-500/10 blur-[110px] -z-10 animate-aurora-slow"
      />
      <div
        aria-hidden
        className="absolute top-[calc(40%-var(--app-header-total))] left-1/2 -translate-x-1/2 w-[min(720px,92vw)] h-[280px] bg-[#1461bd]/10 dark:bg-teal-400/8 blur-[120px] rounded-full pointer-events-none -z-10 animate-blob-drift"
      />

      {/* Subtle grid overlay for depth */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-[calc(-1*var(--app-header-total))] bottom-0 opacity-[0.35] dark:opacity-[0.18] -z-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 text-center">
        {/* Badge */}
        <div className="hero-rise-1 mb-5 sm:mb-6 flex justify-center">
          <p className="group inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700/70 bg-white/85 dark:bg-slate-900/85 px-3.5 py-1.5 text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm backdrop-blur-sm transition-colors hover:border-[#1461bd]/40 dark:hover:border-teal-400/40">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-500/70 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="material-symbols-outlined !text-[15px] text-[#1461bd] dark:text-teal-400">
              verified_user
            </span>
            {t("home.hero.badge")}
          </p>
        </div>

        {/* Heading */}
        <h1 className="hero-rise-2 text-[2rem] leading-[1.12] sm:text-5xl sm:leading-[1.08] lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto text-balance">
          <span className="block text-slate-900 dark:text-slate-100">
            {t("home.hero.titleLead")}
          </span>
          <span className="relative inline-block mt-1.5 sm:mt-2">
            <HeroAccentLine t={t} />
            <span
              aria-hidden
              className="hero-underline absolute left-1/2 -translate-x-1/2 -bottom-1 sm:-bottom-1.5 h-[3px] w-3/4 rounded-full bg-gradient-to-r from-transparent via-[#1461bd] to-transparent dark:via-teal-400"
            />
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={cn(
            "hero-rise-3 mt-5 sm:mt-7 text-sm sm:text-base lg:text-[1.0625rem]",
            "text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed text-pretty"
          )}
        >
          {t("home.hero.subtitle")}
        </p>

        {/* CTAs */}
        <div className="hero-rise-4 mt-7 sm:mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#tools"
            className={cn(
              "group relative inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all",
              "bg-[#1461bd] text-white shadow-sm shadow-[#1461bd]/25",
              "hover:bg-[#1254a8] hover:shadow-md hover:shadow-[#1461bd]/30 hover:-translate-y-px",
              "dark:bg-teal-600 dark:shadow-teal-600/25 dark:hover:bg-teal-500 dark:hover:shadow-teal-500/30"
            )}
          >
            <span>{t("home.hero.browseTools")}</span>
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-y-0.5">
              expand_more
            </span>
          </a>
          <a
            href="#how-it-works"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all",
              "text-slate-700 dark:text-slate-200",
              "bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm",
              "border border-slate-200/80 dark:border-slate-700/80",
              "hover:bg-white hover:border-slate-300 hover:-translate-y-px hover:shadow-sm",
              "dark:hover:bg-slate-900 dark:hover:border-slate-600"
            )}
          >
            <span className="material-symbols-outlined text-[18px] text-[#1461bd] dark:text-teal-400">
              play_circle
            </span>
            {t("home.hero.secondaryCta")}
          </a>
        </div>

        {/* Trust strip */}
        <ul
          className={cn(
            "hero-rise-5 mt-8 sm:mt-10 mx-auto max-w-3xl",
            "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
          )}
        >
          {TRUST_STATS.map(({ key, icon }) => (
            <li
              key={key}
              className={cn(
                "flex items-center justify-center sm:justify-start gap-2 rounded-lg",
                "px-3 py-2 sm:px-3.5 sm:py-2.5",
                "bg-white/65 dark:bg-slate-900/55 backdrop-blur-sm",
                "border border-slate-200/70 dark:border-slate-800/70",
                "text-left"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0",
                  "bg-[#1461bd]/10 text-[#1461bd] dark:bg-teal-400/15 dark:text-teal-300"
                )}
              >
                <span className="material-symbols-outlined !text-[16px]">
                  {icon}
                </span>
              </span>
              <span className="flex flex-col leading-tight min-w-0">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {statValue(key)}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {statLabel(key)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
