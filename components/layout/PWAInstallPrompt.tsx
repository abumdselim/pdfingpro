"use client";

import { useEffect, useState, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type PromptState = "idle" | "installing" | "success";
type BannerMode = "android" | "ios" | null;

const FEATURES = [
  { icon: "offline_bolt", label: "Works offline" },
  { icon: "speed", label: "Instant launch" },
  { icon: "lock", label: "100% private" },
];

/** Detect iOS (iPhone/iPad) */
function isIOS() {
  return (
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !("MSStream" in window)
  );
}

/** Detect standalone mode (already installed) */
function isStandalone() {
  return (
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [visible, setVisible] = useState(false);
  const [promptState, setPromptState] = useState<PromptState>("idle");
  const [bannerMode, setBannerMode] = useState<BannerMode>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Already installed — don't show
    if (isStandalone()) return;

    const dismissedTime = localStorage.getItem("pwa-install-prompt-dismissed");
    if (dismissedTime) {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - Number(dismissedTime) < sevenDays) return;
    }

    // ── iOS: no beforeinstallprompt, show manual guide ──
    if (isIOS()) {
      setBannerMode("ios");
      setShowPrompt(true);
      timerRef.current = setTimeout(() => setVisible(true), 200);
      return;
    }

    // ── Android/Chrome/Edge: use native prompt API ──
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setBannerMode("android");
      setShowPrompt(true);
      timerRef.current = setTimeout(() => setVisible(true), 80);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      doHide();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const doHide = (extraDelay = 0) => {
    setVisible(false);
    timerRef.current = setTimeout(() => setShowPrompt(false), 450 + extraDelay);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt || promptState !== "idle") return;
    setPromptState("installing");
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setPromptState("success");
      timerRef.current = setTimeout(() => {
        setDeferredPrompt(null);
        doHide(300);
      }, 1800);
    } else {
      setPromptState("idle");
    }
  };

  const handleDismissClick = () => {
    localStorage.setItem("pwa-install-prompt-dismissed", Date.now().toString());
    doHide();
  };

  if (!showPrompt) return null;

  // ─────────────────────────────────────────────
  // iOS Banner — step-by-step guide
  // ─────────────────────────────────────────────
  if (bannerMode === "ios") {
    return (
      <>
        {/* Mobile backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/10 dark:bg-black/25 backdrop-blur-[2px] transition-opacity duration-400 ${
            visible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={handleDismissClick}
          aria-hidden="true"
        />

        <div
          role="dialog"
          aria-label="Install Pdfing Pro on iOS"
          className={`fixed z-50 bottom-0 left-0 right-0 transition-all duration-[420ms] ${
            visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        >
          <div className="
            relative overflow-hidden rounded-t-3xl
            bg-white/[0.97] dark:bg-slate-900/[0.97]
            border-t border-x border-slate-200/70 dark:border-slate-700/60
            shadow-[0_-8px_40px_rgba(0,0,0,0.10)]
            dark:shadow-[0_-8px_40px_rgba(0,0,0,0.40)]
            backdrop-blur-xl
            px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]
          ">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-indigo-500/8 blur-3xl" />

            {/* Drag handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-slate-300/80 dark:bg-slate-600/70" />

            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl bg-blue-500/25 blur-[8px] scale-110" />
                  <img
                    src="/icons/icon-192x192.png"
                    alt="Pdfing Pro"
                    className="relative w-11 h-11 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[15px] text-slate-900 dark:text-white">Pdfing Pro</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-gradient-to-r from-[#1461bd] to-[#0b3e7b] px-1.5 py-0.5 rounded-full">Free</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Add to your Home Screen</p>
                </div>
              </div>
              <button
                onClick={handleDismissClick}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Dismiss"
              >
                <span className="material-symbols-outlined !text-[18px]">close</span>
              </button>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                <div className="shrink-0 w-8 h-8 rounded-xl bg-[#1461bd]/10 dark:bg-[#1461bd]/20 flex items-center justify-center">
                  <span className="text-[13px] font-black text-[#1461bd]">1</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">Tap the Share button</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Tap{" "}
                    <span className="inline-flex items-center gap-0.5 font-medium text-[#1461bd] dark:text-blue-400">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
                      </svg>
                      Share
                    </span>
                    {" "}at the bottom of your browser
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                <div className="shrink-0 w-8 h-8 rounded-xl bg-[#1461bd]/10 dark:bg-[#1461bd]/20 flex items-center justify-center">
                  <span className="text-[13px] font-black text-[#1461bd]">2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">Tap "Add to Home Screen"</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Scroll down in the share sheet and tap this option</p>
                </div>
                <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-slate-700/60 flex items-center justify-center">
                  <span className="material-symbols-outlined !text-[15px] text-slate-500 dark:text-slate-400 icon-filled">add_box</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#1461bd]/8 to-[#0b3e7b]/8 dark:from-[#1461bd]/15 dark:to-[#0b3e7b]/15 border border-[#1461bd]/15 dark:border-[#1461bd]/25">
                <div className="shrink-0 w-8 h-8 rounded-xl bg-[#1461bd]/15 dark:bg-[#1461bd]/25 flex items-center justify-center">
                  <span className="text-[13px] font-black text-[#1461bd]">3</span>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">Tap "Add" to confirm</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">The app will appear on your Home Screen ✓</p>
                </div>
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={handleDismissClick}
              className="w-full mt-4 text-center text-[12px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 py-1.5 transition-colors duration-200"
            >
              I'll do it later
            </button>
          </div>
        </div>

        {/* Arrow pointing to share button */}
        <div
          className={`fixed z-50 bottom-[calc(env(safe-area-inset-bottom,0px)+380px)] left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-500 delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <p className="text-[11px] font-semibold text-white bg-slate-900/80 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
              Tap <svg className="inline w-3 h-3 mx-0.5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg> Share below
            </p>
            <svg className="w-4 h-4 text-slate-900 dark:text-slate-100 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 20l-8-12h16z"/>
            </svg>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────
  // Android / Desktop Banner (beforeinstallprompt)
  // ─────────────────────────────────────────────
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/10 dark:bg-black/25 backdrop-blur-[2px] md:hidden transition-opacity duration-400 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleDismissClick}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Install Pdfing Pro"
        className={`fixed z-50
          bottom-0 left-0 right-0
          md:bottom-6 md:left-auto md:right-6 md:w-[400px]
          transition-all duration-[420ms]
          ${visible
            ? "translate-y-0 opacity-100"
            : "translate-y-full md:translate-y-10 opacity-0 pointer-events-none"
          }
        `}
        style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        <div className="
          relative overflow-hidden
          rounded-t-3xl md:rounded-3xl
          bg-white/[0.97] dark:bg-slate-900/[0.97]
          border border-slate-200/70 dark:border-slate-700/60
          shadow-[0_-8px_40px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.04)]
          dark:shadow-[0_-8px_40px_rgba(0,0,0,0.40),0_2px_8px_rgba(0,0,0,0.25)]
          backdrop-blur-xl
          p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]
          md:pb-5
        ">
          <div className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-blue-500/10 dark:bg-blue-400/[0.07] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-indigo-500/8 dark:bg-indigo-400/[0.06] blur-3xl" />

          <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-slate-300/80 dark:bg-slate-600/70" />

          {/* ── Row 1: Icon + name + close ── */}
          <div className="flex items-start gap-3.5 mt-2 md:mt-0">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/25 dark:bg-blue-400/15 blur-[10px] scale-110" />
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shadow-md bg-white dark:bg-slate-800">
                <img src="/icons/icon-192x192.png" alt="Pdfing Pro" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[16px] text-slate-900 dark:text-white leading-tight tracking-tight">
                  Pdfing Pro
                </h3>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-gradient-to-r from-[#1461bd] to-[#0b3e7b] px-1.5 py-0.5 rounded-full leading-none">
                  Free
                </span>
              </div>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Install for faster access to 106+ PDF tools
              </p>
              <div className="flex items-center gap-0.5 mt-1.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
                <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">5.0</span>
              </div>
            </div>

            <button
              onClick={handleDismissClick}
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 -mr-1 -mt-0.5"
              aria-label="Dismiss"
            >
              <span className="material-symbols-outlined !text-[18px]">close</span>
            </button>
          </div>

          {/* ── Row 2: Feature pills ── */}
          <div className="flex items-center gap-2 mt-4">
            {FEATURES.map(({ icon, label }) => (
              <div
                key={label}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
              >
                <span className="material-symbols-outlined !text-[14px] text-[#1461bd] dark:text-blue-400 icon-filled">
                  {icon}
                </span>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-slate-100 dark:bg-slate-800" />

          {/* ── Install CTA ── */}
          <button
            onClick={handleInstallClick}
            disabled={promptState !== "idle"}
            aria-live="polite"
            className={`
              relative w-full flex items-center justify-between
              px-5 py-3.5 rounded-2xl overflow-hidden
              transition-all duration-300
              hover:scale-[1.012] active:scale-[0.988]
              disabled:cursor-not-allowed
              ${promptState === "success"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_6px_20px_rgba(16,185,129,0.30)]"
                : "bg-gradient-to-r from-[#1461bd] to-[#0b3e7b] hover:from-[#1a6fd4] hover:to-[#0e4b96] shadow-[0_6px_20px_rgba(20,97,189,0.28)] hover:shadow-[0_8px_28px_rgba(20,97,189,0.40)]"
              }
            `}
          >
            {promptState === "idle" && (
              <span
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: "pwa-shimmer-btn 2.8s linear infinite",
                }}
              />
            )}

            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
                promptState === "success"
                  ? "bg-white/20"
                  : "bg-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.20)]"
              }`}>
                {promptState === "installing" && (
                  <span className="material-symbols-outlined !text-[18px] text-white animate-spin">progress_activity</span>
                )}
                {promptState === "success" && (
                  <span className="material-symbols-outlined !text-[18px] text-white icon-filled">check_circle</span>
                )}
                {promptState === "idle" && (
                  <span className="material-symbols-outlined !text-[18px] text-white">download</span>
                )}
              </div>
              <div className="text-left">
                <div className="text-[14px] font-bold text-white leading-tight">
                  {promptState === "installing" ? "Installing…" : promptState === "success" ? "Installed!" : "Install App"}
                </div>
                <div className="text-[11px] text-white/70 font-medium leading-tight">
                  {promptState === "success" ? "Enjoy Pdfing Pro 🎉" : "Free · No sign-up required"}
                </div>
              </div>
            </div>

            {promptState === "idle" && (
              <span className="material-symbols-outlined !text-[20px] text-white/60 shrink-0">chevron_right</span>
            )}
          </button>

          <button
            onClick={handleDismissClick}
            className="w-full mt-2.5 text-center text-[12px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 py-1.5 transition-colors duration-200"
          >
            Not now
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pwa-shimmer-btn {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>
    </>
  );
}
