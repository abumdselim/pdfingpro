"use client";

import Link from "next/link";
import React, { useState } from "react";
import { TOOLS, CATEGORIES, type ToolCategory } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t } = useTranslation();

  const filtered =
    activeCategory === "all"
      ? TOOLS
      : TOOLS.filter((tool) => tool.category === activeCategory);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/40 to-transparent -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-teal-400/8 blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="animate-fade-in-up flex justify-center w-full" style={{ animationDelay: '0ms' }}>
            <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-white/70 border border-slate-200/80 shadow-sm text-slate-600 text-[clamp(0.5625rem,2.6vw,0.75rem)] font-bold px-3 sm:px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
              {t("home.hero.badge")}
            </div>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600 tracking-tight leading-[1.08]">
              {t("home.hero.title")}
            </h1>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '160ms' }}>
            <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {t("home.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        {/* Category tabs */}
        {/* Desktop View */}
        <div className="hidden sm:flex gap-2 mb-10 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm shrink-0 whitespace-nowrap",
                activeCategory === cat.id
                  ? "bg-[#1461bd] text-white shadow-md shadow-[#1461bd]/20 border border-[#1461bd]/10"
                  : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
              )}
            >
              {t(cat.labelKey)}
            </button>
          ))}
        </div>

        {/* Mobile View Dropdown */}
        <div className="sm:hidden relative mb-10 w-full max-w-[280px] mx-auto z-40">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-5 py-3 bg-[#1461bd] text-white rounded-xl text-sm font-semibold shadow-md shadow-[#1461bd]/20 border border-[#1461bd]/10 transition-all focus:outline-none"
          >
            <span>{t(CATEGORIES.find((cat) => cat.id === activeCategory)?.labelKey || "categories.all")}</span>
            <span className={cn("material-symbols-outlined transition-transform duration-300 text-[20px]", isDropdownOpen && "rotate-180")}>
              keyboard_arrow_down
            </span>
          </button>

          {isDropdownOpen && (
            <>
              {/* Overlay backdrop to close dropdown on click outside */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200/80 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setIsDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-5 py-3 text-sm font-semibold transition-colors border-b border-slate-100 last:border-b-0",
                      activeCategory === cat.id
                        ? "text-[#1461bd] bg-blue-50/50"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {t(cat.labelKey)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Compact Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group glass-panel rounded-2xl p-5 hover:shadow-bento hover:-translate-y-1 transition-all duration-500 flex flex-col items-start bg-white"
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-500", tool.color)}>
                <span className="material-symbols-outlined text-[24px]">{tool.icon}</span>
              </div>
              <h2 className="text-[15px] font-bold text-slate-800 group-hover:text-slate-900 transition-colors leading-snug">
                {t(tool.titleKey)}
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                {t(tool.descriptionKey)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* About: privacy + workflow */}
      <section className="relative overflow-hidden border-t border-white/20">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl text-center mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t("home.filesStay.title")}
            </h2>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              {t("home.filesStay.body")}
            </p>
          </div>

          {/* Simple visual flow */}
          {/* Desktop/Large Tablet View (Horizontal Stepper) */}
          <div className="hidden lg:flex items-center justify-center gap-4 xl:gap-8 mt-16">
            {[
              { icon: "folder_open", titleKey: "home.step1.title", bodyKey: "home.step1.body", stepNum: "01" },
              { icon: "bolt", titleKey: "home.step2.title", bodyKey: "home.step2.body", stepNum: "02" },
              { icon: "download", titleKey: "home.step3.title", bodyKey: "home.step3.body", stepNum: "03" },
            ].map((step, index, arr) => (
              <React.Fragment key={step.titleKey}>
                <div className="relative bg-white border border-slate-200/60 rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 w-full max-w-[240px] xl:max-w-[260px] flex flex-col items-center text-center shadow-sm">
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 left-6 px-2.5 py-0.5 bg-[#1461bd]/10 text-[#1461bd] rounded-full text-[10px] font-bold tracking-wider">
                    STEP {step.stepNum}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-[#1461bd] flex items-center justify-center shadow-sm mb-4 mt-2">
                    <span className="material-symbols-outlined text-[20px] icon-filled">
                      {step.icon}
                    </span>
                  </div>

                  {/* Title & Body */}
                  <h3 className="font-bold text-slate-800 text-[14px] xl:text-[15px]">{t(step.titleKey)}</h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t(step.bodyKey)}</p>
                </div>

                {/* Connecting Arrow */}
                {index < arr.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center text-[#1461bd]/60 shrink-0">
                    <span className="material-symbols-outlined text-[24px] xl:text-[28px]">arrow_forward</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile & Tablet View (Vertical Timeline) */}
          <div className="lg:hidden relative flex flex-col gap-8 sm:gap-10 mt-12 max-w-[280px] sm:max-w-[400px] mx-auto">
            {/* Timeline connector line */}
            <div className="absolute left-[23px] sm:left-[27px] top-4 bottom-4 w-[1.5px] sm:w-[2px] bg-slate-200" />

            {[
              { icon: "folder_open", titleKey: "home.step1.title", bodyKey: "home.step1.body", stepNum: "01" },
              { icon: "bolt", titleKey: "home.step2.title", bodyKey: "home.step2.body", stepNum: "02" },
              { icon: "download", titleKey: "home.step3.title", bodyKey: "home.step3.body", stepNum: "03" },
            ].map((step) => (
              <div key={step.titleKey} className="flex items-start gap-4 sm:gap-6 relative z-10">
                {/* Icon Circle */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border border-slate-200/80 text-[#1461bd] flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px] sm:text-[24px] icon-filled">
                    {step.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col pt-1 sm:pt-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 bg-[#1461bd]/10 text-[#1461bd] rounded">
                      STEP {step.stepNum}
                    </span>
                    <h3 className="font-bold text-slate-800 text-[13px] sm:text-[15px]">{t(step.titleKey)}</h3>
                  </div>
                  <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-[13px] text-slate-500 leading-relaxed">{t(step.bodyKey)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Key promises */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "cloud_off", titleKey: "home.noUploads.title", bodyKey: "home.noUploads.body" },
              { icon: "visibility_off", titleKey: "home.noTracking.title", bodyKey: "home.noTracking.body" },
              { icon: "lock", titleKey: "home.privateByDesign.title", bodyKey: "home.privateByDesign.body" },
            ].map((item) => (
              <div key={item.titleKey} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px] icon-filled">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{t(item.titleKey)}</p>
                    <p className="mt-1 text-sm text-slate-600">{t(item.bodyKey)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px] icon-filled">info</span>
              </div>
              <div>
                <p className="font-semibold text-amber-900">{t("home.importantNote.title")}</p>
                <p className="mt-1 text-sm text-amber-800 leading-relaxed">
                  {t("home.importantNote.body")}
                </p>
              </div>
            </div>
          </div>
          <div className="text-center max-w-2xl mx-auto mt-20">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {t("home.offline.title")}
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              {t("home.offline.body")}
            </p>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: "wifi_off", labelKey: "home.offline.features.noInternet" },
                { icon: "speed", labelKey: "home.offline.features.fast" },
                { icon: "security", labelKey: "home.offline.features.secure" },
                { icon: "install_mobile", labelKey: "home.offline.features.installable" },
              ].map(({ icon, labelKey }) => (
                <div key={icon} className="flex flex-col items-center gap-3 p-4 glass-panel rounded-2xl hover:shadow-sm transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-teal-600 icon-filled text-[28px]">{icon}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600">{t(labelKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Privacy callout — compact, no duplication */}
      <section className="border-t border-slate-100 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-6 py-14 grid sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: "lock",     titleKey: "home.private.title",        bodyKey: "home.private.body" },
            { icon: "wifi_off", titleKey: "home.offlineSupport.title", bodyKey: "home.offlineSupport.body" },
            { icon: "bolt",     titleKey: "home.noLimits.title",       bodyKey: "home.noLimits.body" },
          ].map(({ icon, titleKey, bodyKey }) => (
            <div key={titleKey} className="flex flex-col items-center gap-3 px-4">
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center ring-1 ring-teal-100">
                <span className="material-symbols-outlined text-teal-600 icon-filled text-[22px]">{icon}</span>
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">{t(titleKey)}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t(bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
