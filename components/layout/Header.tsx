"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-teal-600 icon-filled text-[28px]">
            picture_as_pdf
          </span>
          <span className="font-semibold text-lg text-slate-900 tracking-tight">
            {t("header.appName")}
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="hidden md:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded hover:bg-slate-50 transition-colors"
          >
            {t("header.allTools")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
