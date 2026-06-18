"use client";

import BentoPanel from "@/components/home/BentoPanel";

interface PrivacyBentoProps {
  t: (key: string) => string;
}

export default function PrivacyBento({ t }: PrivacyBentoProps) {
  const steps = [
    { icon: "folder_open", titleKey: "home.step1.title", bodyKey: "home.step1.body" },
    { icon: "bolt", titleKey: "home.step2.title", bodyKey: "home.step2.body" },
    { icon: "download", titleKey: "home.step3.title", bodyKey: "home.step3.body" },
  ];

  const promises = [
    { icon: "cloud_off", titleKey: "home.noUploads.title", bodyKey: "home.noUploads.body" },
    { icon: "visibility_off", titleKey: "home.noTracking.title", bodyKey: "home.noTracking.body" },
    { icon: "lock", titleKey: "home.privateByDesign.title", bodyKey: "home.privateByDesign.body" },
  ];

  const offlineFeatures = [
    { icon: "wifi_off", labelKey: "home.offline.features.noInternet" },
    { icon: "speed", labelKey: "home.offline.features.fast" },
    { icon: "security", labelKey: "home.offline.features.secure" },
    { icon: "install_mobile", labelKey: "home.offline.features.installable" },
  ];

  return (
    <section className="border-t border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-slate-50/80 to-transparent dark:from-slate-900/50">
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("home.filesStay.title")}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
            {t("home.filesStay.body")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Workflow */}
          <BentoPanel className="sm:col-span-2 lg:col-span-2 lg:row-span-2 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#1461bd] dark:text-teal-400 mb-5">
              {t("home.bento.howItWorks")}
            </p>
            <ol className="space-y-5">
              {steps.map((step, i) => (
                <li key={step.titleKey} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1461bd]/10 dark:bg-teal-500/15 text-[#1461bd] dark:text-teal-400">
                    <span className="material-symbols-outlined text-[20px] icon-filled">{step.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t(step.titleKey)}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t(step.bodyKey)}</p>
                  </div>
                  <span className="sr-only">Step {i + 1}</span>
                </li>
              ))}
            </ol>
          </BentoPanel>

          {/* Promise tiles — fill cols 3–4 beside workflow on lg */}
          {promises.map((item) => (
            <BentoPanel key={item.titleKey} className="p-5 flex flex-col">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 mb-3">
                <span className="material-symbols-outlined text-[22px] icon-filled">{item.icon}</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t(item.titleKey)}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">{t(item.bodyKey)}</p>
            </BentoPanel>
          ))}

          <BentoPanel accent className="p-5 flex flex-col">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1461bd]/10 dark:bg-teal-500/15 text-[#1461bd] dark:text-teal-400 mb-3">
              <span className="material-symbols-outlined text-[22px] icon-filled">bolt</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t("home.noLimits.title")}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t("home.noLimits.body")}</p>
          </BentoPanel>

          <BentoPanel warning className="sm:col-span-2 p-5 flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
              <span className="material-symbols-outlined text-[22px] icon-filled">info</span>
            </div>
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">{t("home.importantNote.title")}</p>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">{t("home.importantNote.body")}</p>
            </div>
          </BentoPanel>

          <BentoPanel accent className="sm:col-span-2 p-5 flex flex-col">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1461bd]/10 dark:bg-teal-500/15 text-[#1461bd] dark:text-teal-400 mb-3">
              <span className="material-symbols-outlined text-[22px] icon-filled">shield</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t("home.private.title")}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t("home.private.body")}</p>
          </BentoPanel>
        </div>

        {/* Offline PWA */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("home.offline.title")}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t("home.offline.body")}</p>
        </div>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {offlineFeatures.map(({ icon, labelKey }) => (
            <BentoPanel
              key={icon}
              className="flex flex-col items-center gap-2 py-4 px-3 text-center hover:shadow-sm transition-shadow"
            >
              <span className="material-symbols-outlined text-[#1461bd] dark:text-teal-400 icon-filled text-[26px]">{icon}</span>
              <p className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400">{t(labelKey)}</p>
            </BentoPanel>
          ))}
        </div>
      </div>
    </section>
  );
}
