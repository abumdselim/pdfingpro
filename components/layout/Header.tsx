"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import ThemeToggle from "@/components/layout/ThemeToggle";

const LOGO_LIGHT =
  "https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781765282/bengaldesk_3_svpztz.png";
const LOGO_DARK =
  "https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781764576/bengaldesk_2_tc3czo.png";

export default function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60">
      <div className="max-w-6xl mx-auto h-16 flex items-center justify-between px-6 relative">
        <Link href="/" className="flex items-center group shrink-0" onClick={closeMenu}>
          <img
            src={LOGO_LIGHT}
            alt="Pdfing Pro Logo"
            width={152}
            height={38}
            className="h-[38px] w-auto max-h-[38px] drop-shadow-sm transition-transform duration-300 group-hover:scale-105 dark:hidden"
          />
          <img
            src={LOGO_DARK}
            alt="Pdfing Pro Logo"
            width={152}
            height={38}
            className="h-[38px] w-auto max-h-[38px] drop-shadow-sm transition-transform duration-300 group-hover:scale-105 hidden dark:block"
          />
        </Link>

        <nav
          className="flex items-center rounded-lg border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/70 shadow-sm overflow-hidden"
          aria-label={t("header.appName")}
        >
          <ThemeToggle segmented />
          <Link
            href="/#tools"
            className="hidden md:inline-flex h-9 items-center justify-center border-l border-slate-200/70 dark:border-slate-700/70 px-3.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#1461bd] dark:hover:text-teal-400 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
          >
            {t("header.allTools")}
          </Link>
          <button
            type="button"
            className="md:hidden flex h-9 w-9 items-center justify-center border-l border-slate-200/70 dark:border-slate-700/70 bg-[#1461bd] text-white hover:bg-[#104d96] transition-colors"
            aria-label={menuOpen ? t("header.closeMenu") : t("header.openMenu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="material-symbols-outlined !text-[18px]">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </nav>

        {menuOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              aria-label={t("header.closeMenu")}
              onClick={closeMenu}
            />
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-700/60 shadow-lg z-50 md:hidden">
              <nav className="px-6 py-4 flex flex-col">
                <Link
                  href="/#tools"
                  onClick={closeMenu}
                  className="py-3 text-sm font-semibold text-[#1461bd] dark:text-teal-400 transition-colors"
                >
                  {t("header.allTools")}
                </Link>
                <Link
                  href="/privacy"
                  onClick={closeMenu}
                  className="py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#1461bd] transition-colors"
                >
                  {t("legal.footer.privacy")}
                </Link>
                <Link
                  href="/terms"
                  onClick={closeMenu}
                  className="py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#1461bd] transition-colors"
                >
                  {t("legal.footer.terms")}
                </Link>
                <Link
                  href="/contact"
                  onClick={closeMenu}
                  className="py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#1461bd] transition-colors"
                >
                  {t("legal.footer.contact")}
                </Link>

                <div className="mt-3 pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                  <a
                    href="https://inievo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    className="flex flex-col items-center justify-center gap-2 py-3 w-full rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    aria-label={t("header.aboutInievo")}
                  >
                    <img
                      src="https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781425405/Inievo_ujfqno.png"
                      alt="Inievo Technologies"
                      className="h-6 w-auto max-w-[200px] object-contain"
                    />
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-[#1461bd] dark:group-hover:text-teal-400 transition-colors">
                      {t("header.aboutInievo")}
                      <span className="material-symbols-outlined !text-[14px]">open_in_new</span>
                    </span>
                  </a>
                </div>
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
