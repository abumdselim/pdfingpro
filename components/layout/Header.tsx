"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n";

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/75 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300">
      <div className="max-w-5xl mx-auto h-16 flex items-center justify-between px-6">
        <Link href="/" className="flex items-center group">
          <img 
            src="https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781765282/bengaldesk_3_svpztz.png" 
            alt="Pdfing Pro Logo" 
            className="h-10 w-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105" 
          />
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden md:inline-flex items-center justify-center text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-md hover:bg-slate-100/80 transition-colors"
          >
            {t("header.allTools")}
          </Link>
          <button
            className="md:hidden flex items-center justify-center p-1.5 bg-[#1461bd] text-white hover:bg-[#104d96] rounded-sm transition-colors shadow-sm"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined !text-[18px]">menu</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
