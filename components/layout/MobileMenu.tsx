"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

const NAV_LINKS = [
  { href: "/#tools", labelKey: "header.allTools", icon: "grid_view", featured: true },
  { href: "/privacy", labelKey: "legal.footer.privacy", icon: "shield" },
  { href: "/terms", labelKey: "legal.footer.terms", icon: "description" },
  { href: "/contact", labelKey: "legal.footer.contact", icon: "mail" },
] as const;

const PANEL_MS = 320;

export default function MobileMenu({ open, onClose, t }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), PANEL_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    closeBtnRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="presentation">
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out",
          visible ? "opacity-100" : "opacity-0"
        )}
        aria-label={t("header.closeMenu")}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t("header.menu")}
        className={cn(
          "mobile-menu-panel absolute top-0 right-0 flex h-full w-[min(20rem,88vw)] flex-col",
          "border-l border-slate-200/80 dark:border-slate-700/80",
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          visible ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/70 dark:border-slate-700/70 px-5">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t("header.menu")}
          </p>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              "text-slate-600 dark:text-slate-300",
              "hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            )}
            aria-label={t("header.closeMenu")}
          >
            <span className="material-symbols-outlined !text-[22px]">close</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto touch-scroll px-4 py-5">
          <ul className="space-y-2">
            {NAV_LINKS.map((item, index) => {
              const featured = "featured" in item && item.featured;
              return (
              <li
                key={item.href}
                className={cn(visible && "animate-mobile-menu-item")}
                style={visible ? { animationDelay: `${80 + index * 50}ms` } : undefined}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3.5 py-3.5 transition-all duration-200",
                    featured
                      ? "bg-[#1461bd] text-white shadow-md shadow-[#1461bd]/20 hover:bg-[#1254a8] dark:bg-teal-600 dark:shadow-teal-600/20 dark:hover:bg-teal-500"
                      : "border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 hover:border-[#1461bd]/30 dark:hover:border-teal-500/40 hover:bg-white dark:hover:bg-slate-800"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      featured
                        ? "bg-white/15"
                        : "bg-white dark:bg-slate-700/80 text-[#1461bd] dark:text-teal-400"
                    )}
                  >
                    <span className="material-symbols-outlined !text-[20px] icon-filled">{item.icon}</span>
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-[15px] font-semibold",
                      featured ? "text-white" : "text-slate-800 dark:text-slate-100"
                    )}
                  >
                    {t(item.labelKey)}
                  </span>
                  <span
                    className={cn(
                      "material-symbols-outlined !text-[18px] transition-transform duration-200 group-hover:translate-x-0.5",
                      featured ? "text-white/80" : "text-slate-300 dark:text-slate-600 group-hover:text-[#1461bd] dark:group-hover:text-teal-400"
                    )}
                  >
                    chevron_right
                  </span>
                </Link>
              </li>
            );
            })}
          </ul>
        </nav>

        <div
          className={cn(
            "shrink-0 border-t border-slate-200/80 dark:border-slate-700/80 px-4 py-4",
            visible && "animate-mobile-menu-item"
          )}
          style={visible ? { animationDelay: "280ms" } : undefined}
        >
          <a
            href="https://inievo.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/50 px-4 py-4 transition-colors hover:bg-white dark:hover:bg-slate-800 group"
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
      </div>
    </div>
  );
}
