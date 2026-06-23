"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import ThemeToggle from "@/components/layout/ThemeToggle";
import MobileMenu from "@/components/layout/MobileMenu";
import ToolSearch from "@/components/layout/ToolSearch";
import { cn } from "@/lib/utils";

const LOGO_LIGHT =
  "https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781765282/bengaldesk_3_svpztz.png";
const LOGO_DARK =
  "https://res.cloudinary.com/dgcnhseqm/image/upload/q_auto/f_auto/v1781764576/bengaldesk_2_tc3czo.png";

export default function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const closeMenu = () => setMenuOpen(false);

  const openSearchFromMenu = () => {
    setMenuOpen(false);
    setSearchOpen(true);
  };

  return (
    <>
      <header
        className={cn(
          "app-header-shell sticky top-0 z-50 w-full border-b transition-[background,border-color,box-shadow] duration-300",
          "h-14 md:h-16",
          "bg-[#f8fafc]/95 dark:bg-slate-900/95 backdrop-blur-md",
          "border-slate-200/80 dark:border-slate-700/80",
          "shadow-sm shadow-slate-900/[0.03] dark:shadow-black/20"
        )}
      >
        <div className="max-w-6xl mx-auto h-14 md:h-16 flex items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center group shrink-0 min-w-0" onClick={closeMenu}>
            <img
              src={LOGO_LIGHT}
              alt="Pdfing Pro Logo"
              width={152}
              height={38}
              className="h-8 sm:h-[38px] w-auto max-h-[38px] drop-shadow-sm transition-transform duration-300 group-hover:scale-105 group-active:scale-[0.98] dark:hidden"
            />
            <img
              src={LOGO_DARK}
              alt="Pdfing Pro Logo"
              width={152}
              height={38}
              className="h-8 sm:h-[38px] w-auto max-h-[38px] drop-shadow-sm transition-transform duration-300 group-hover:scale-105 group-active:scale-[0.98] hidden dark:block"
            />
          </Link>

          <nav
            className={cn(
              "flex items-center overflow-hidden shrink-0",
              "rounded-lg border border-slate-200/80 dark:border-slate-700/80",
              "bg-white/90 dark:bg-slate-800/90 shadow-sm"
            )}
            aria-label={t("header.appName")}
          >
            <ThemeToggle segmented />
            <ToolSearch t={t} open={searchOpen} onOpenChange={setSearchOpen} />
            <Link
              href="/#tools"
              className="hidden md:inline-flex h-9 items-center justify-center border-l border-slate-200/70 dark:border-slate-700/70 px-3.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#1461bd] dark:hover:text-teal-400 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
            >
              {t("header.allTools")}
            </Link>
            <button
              type="button"
              className={cn(
                "md:hidden relative flex h-9 w-9 items-center justify-center border-l transition-colors active:scale-95",
                "border-slate-200/50 dark:border-slate-700/50",
                menuOpen
                  ? "bg-slate-100/90 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200"
                  : "text-slate-700 dark:text-slate-200 hover:text-[#1461bd] dark:hover:text-teal-400"
              )}
              aria-label={menuOpen ? t("header.closeMenu") : t("header.openMenu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span
                className={cn(
                  "material-symbols-outlined !text-[20px] transition-transform duration-300",
                  menuOpen && "rotate-90"
                )}
              >
                {menuOpen ? "close" : "menu"}
              </span>
            </button>
          </nav>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} onOpenSearch={openSearchFromMenu} t={t} />
    </>
  );
}
