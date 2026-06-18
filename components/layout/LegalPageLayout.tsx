"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export interface LegalSection {
  id: string;
  titleKey: string;
  paragraphKeys: string[];
  listKeys?: string[];
}

interface LegalPageLayoutProps {
  icon: string;
  iconClass?: string;
  titleKey: string;
  subtitleKey: string;
  lastUpdatedKey: string;
  sections: LegalSection[];
  children?: React.ReactNode;
}

export default function LegalPageLayout({
  icon,
  iconClass = "bg-blue-50 text-[#1461bd]",
  titleKey,
  subtitleKey,
  lastUpdatedKey,
  sections,
  children,
}: LegalPageLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-14 pb-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
        <div className="max-w-3xl mx-auto px-6 py-12 text-center animate-fade-in-up">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-full transition-colors mb-8"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {t("common.allTools")}
          </Link>

          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 mb-6 shadow-sm mx-auto",
              iconClass
            )}
          >
            <span className="material-symbols-outlined text-[32px]">{icon}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t(titleKey)}
          </h1>
          <p className="text-lg text-slate-500 mt-3 max-w-xl mx-auto leading-relaxed">
            {t(subtitleKey)}
          </p>
          <p className="text-sm text-slate-400 mt-4">{t(lastUpdatedKey)}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 space-y-6 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="glass-panel rounded-2xl p-6 sm:p-8 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t(section.titleKey)}</h2>
            <div className="mt-4 space-y-4 text-[15px] text-slate-600 leading-relaxed">
              {section.paragraphKeys.map((key) => (
                <p key={key}>{t(key)}</p>
              ))}
              {section.listKeys && section.listKeys.length > 0 && (
                <ul className="list-disc pl-5 space-y-2 marker:text-[#1461bd]">
                  {section.listKeys.map((key) => (
                    <li key={key}>{t(key)}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
        {children}
      </div>
    </div>
  );
}
