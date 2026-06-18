"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

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
    <header className="sticky top-0 z-50 w-full h-16 bg-white/75 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-5xl mx-auto h-16 flex items-center justify-between px-6 relative">
        <Link href="/" className="flex items-center group shrink-0" onClick={closeMenu}>
          <img
            src="https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781765282/bengaldesk_3_svpztz.png"
            alt="Pdfing Pro Logo"
            width={160}
            height={40}
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
            type="button"
            className="md:hidden flex items-center justify-center p-1.5 bg-[#1461bd] text-white hover:bg-[#104d96] rounded-sm transition-colors shadow-sm"
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
            <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200/60 shadow-lg z-50 md:hidden">
              <nav className="px-6 py-4 flex flex-col">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="py-3 text-sm font-semibold text-[#1461bd] transition-colors"
                >
                  {t("header.allTools")}
                </Link>
                <Link
                  href="/privacy"
                  onClick={closeMenu}
                  className="py-3 text-sm font-medium text-slate-700 hover:text-[#1461bd] transition-colors"
                >
                  {t("legal.footer.privacy")}
                </Link>
                <Link
                  href="/terms"
                  onClick={closeMenu}
                  className="py-3 text-sm font-medium text-slate-700 hover:text-[#1461bd] transition-colors"
                >
                  {t("legal.footer.terms")}
                </Link>
                <Link
                  href="/contact"
                  onClick={closeMenu}
                  className="py-3 text-sm font-medium text-slate-700 hover:text-[#1461bd] transition-colors"
                >
                  {t("legal.footer.contact")}
                </Link>

                <div className="mt-3 pt-4 border-t border-slate-200/80">
                  <a
                    href="https://inievo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    className="flex flex-col items-center justify-center gap-2 py-3 w-full rounded-xl hover:bg-slate-50 transition-colors group"
                    aria-label={t("header.aboutInievo")}
                  >
                    <img
                      src="https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781425405/Inievo_ujfqno.png"
                      alt="Inievo Technologies"
                      className="h-6 w-auto max-w-[200px] object-contain"
                    />
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-[#1461bd] transition-colors">
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
