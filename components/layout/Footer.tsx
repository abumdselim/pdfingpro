"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { INTACTIC } from "@/lib/branding";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#0b3e7b] mt-auto relative overflow-hidden pb-[var(--app-safe-bottom)]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <img
              src="https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781764576/bengaldesk_2_tc3czo.png"
              alt="Pdfing Pro Logo"
              className="h-12 w-auto drop-shadow-sm"
            />
            <p className="max-w-md text-[13px] text-white/70 leading-relaxed mt-2">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[13px] font-medium text-white/80">
            <Link href="/what-works" className="hover:text-white transition-colors">
              {t("legal.footer.whatWorks")}
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t("legal.footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t("legal.footer.terms")}
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              {t("legal.footer.contact")}
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2.5 mt-4 pt-8 border-t border-white/20 w-full max-w-sm">
            <span className="text-[11px] font-bold tracking-wider uppercase text-white/80 select-none">
              {t("footer.initiativeBy")}
            </span>
            <a
              href={INTACTIC.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <img
                src={INTACTIC.logoWhiteUrl}
                alt={INTACTIC.name}
                className="h-[18px] w-auto object-contain drop-shadow-sm transition-all duration-300 hover:scale-105 relative -top-[0.5px]"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
