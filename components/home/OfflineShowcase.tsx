"use client";

import { cn } from "@/lib/utils";

interface OfflineShowcaseProps {
  t: (key: string) => string;
}

const pillars = [
  { icon: "wifi_off", labelKey: "home.offline.pillar.offline" },
  { icon: "verified_user", labelKey: "home.offline.pillar.secure" },
  { icon: "install_mobile", labelKey: "home.offline.pillar.pwa" },
] as const;

export default function OfflineShowcase({ t }: OfflineShowcaseProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-3 overflow-hidden rounded-2xl",
        "border border-slate-200/80 dark:border-slate-700/80",
        "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm",
        "divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-slate-700/80"
      )}
    >
      {pillars.map(({ icon, labelKey }) => (
        <div
          key={labelKey}
          className="flex flex-col items-center justify-center gap-3 px-6 py-8 sm:py-10 text-center"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1461bd]/10 text-[#1461bd] dark:bg-teal-500/15 dark:text-teal-400">
            <span className="material-symbols-outlined text-[22px] icon-filled">{icon}</span>
          </span>
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-slate-800 dark:text-slate-100">
            {t(labelKey)}
          </p>
        </div>
      ))}
    </div>
  );
}
