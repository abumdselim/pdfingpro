"use client";

import { cn } from "@/lib/utils";
import OfflineShowcase from "@/components/home/OfflineShowcase";

interface PrivacyBentoProps {
  t: (key: string) => string;
}

const surface =
  "rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm";

export default function PrivacyBento({ t }: PrivacyBentoProps) {
  const steps = [
    { icon: "folder_open", titleKey: "home.step1.title", bodyKey: "home.step1.body" },
    { icon: "bolt", titleKey: "home.step2.title", bodyKey: "home.step2.body" },
    { icon: "download", titleKey: "home.step3.title", bodyKey: "home.step3.body" },
  ];

  const promises = [
    {
      icon: "cloud_off",
      titleKey: "home.noUploads.title",
      border: "border-teal-500",
      iconClass: "text-teal-600 dark:text-teal-400",
    },
    {
      icon: "visibility_off",
      titleKey: "home.noTracking.title",
      border: "border-indigo-500",
      iconClass: "text-indigo-600 dark:text-indigo-400",
    },
    {
      icon: "lock",
      titleKey: "home.privateByDesign.title",
      border: "border-violet-500",
      iconClass: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <section className="border-t border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-slate-50/80 to-transparent dark:from-slate-900/50">
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20 space-y-14 sm:space-y-16">
        {/* Important note — top of privacy section */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-700/80",
            "bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-sm",
            "px-5 py-5 sm:px-7 sm:py-6"
          )}
          role="note"
        >
          <div
            className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#1461bd] via-teal-500 to-[#1461bd] dark:from-teal-500 dark:via-teal-400 dark:to-teal-600"
            aria-hidden
          />
          <div className="flex items-start gap-4 sm:gap-5 pl-3 sm:pl-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200/80 dark:ring-slate-600/50">
              <span className="material-symbols-outlined text-[20px] icon-filled">info</span>
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {t("home.importantNote.title")}
              </p>
              <p className="mt-2 text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">
                {t("home.importantNote.body")}
              </p>
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("home.filesStay.title")}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
            {t("home.filesStay.body")}
          </p>
        </div>

        {/* 1 · Process — horizontal journey on your device */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#1461bd] dark:text-teal-400 mb-5">
            {t("home.bento.howItWorks")}
          </p>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div
              className="hidden sm:block absolute top-9 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-teal-300 via-[#1461bd] to-teal-300 dark:from-teal-700 dark:via-teal-500 dark:to-teal-700"
              aria-hidden
            />
            {steps.map((step, i) => (
              <div key={step.titleKey} className={cn(surface, "relative p-5 sm:p-6 text-center sm:text-left")}>
                <div className="mx-auto sm:mx-0 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1461bd]/10 dark:bg-teal-500/15 text-[#1461bd] dark:text-teal-400 ring-2 ring-white dark:ring-slate-800 shadow-sm">
                  <span className="material-symbols-outlined text-[22px] icon-filled">{step.icon}</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">{t(step.titleKey)}</p>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t(step.bodyKey)}
                </p>
                <span className="sr-only">Step {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2 · Trust pillars — minimal, left-accent strips */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-5">
            {t("home.private.title")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {promises.map((item) => (
              <div
                key={item.titleKey}
                className={cn(surface, "flex items-center gap-4 p-4 sm:p-5 border-l-4", item.border)}
              >
                <span className={cn("material-symbols-outlined text-[26px] icon-filled shrink-0", item.iconClass)}>
                  {item.icon}
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug">{t(item.titleKey)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3 · Freedom + shield — contrasting pair */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className={cn(
              surface,
              "flex items-center gap-5 p-6 sm:p-8 bg-gradient-to-br from-teal-50/80 to-white dark:from-teal-950/30 dark:to-slate-800/90"
            )}
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#1461bd] text-white shadow-lg shadow-[#1461bd]/25 dark:bg-teal-600 dark:shadow-teal-600/25">
              <span className="material-symbols-outlined text-[32px] icon-filled">bolt</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {t("home.noLimits.title")}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("home.noLimits.body")}</p>
            </div>
          </div>

          <div
            className={cn(
              "rounded-2xl border border-slate-700/80 dark:border-slate-600/80",
              "bg-slate-800 dark:bg-slate-900 p-6 sm:p-8 flex items-center gap-5"
            )}
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
              <span className="material-symbols-outlined text-[34px] text-teal-400 icon-filled">shield</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white tracking-tight">{t("home.private.title")}</p>
              <p className="mt-1 text-sm text-slate-300">{t("home.private.body")}</p>
            </div>
          </div>
        </div>

        {/* 4 · Offline pillars */}
        <OfflineShowcase t={t} />
      </div>
    </section>
  );
}
