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

const FEATURES = [
  { icon: "offline_bolt", label: "Works offline" },
  { icon: "speed", label: "Instant launch" },
  { icon: "lock", label: "100% private" },
];

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [visible, setVisible] = useState(false);
  const [promptState, setPromptState] = useState<PromptState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const dismissedTime = localStorage.getItem("pwa-install-prompt-dismissed");
    if (dismissedTime) {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - Number(dismissedTime) < sevenDays) return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
      // Slight delay so slide-up animation plays after mount
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

      {/* Card wrapper */}
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
        {/* Card surface */}
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
          {/* Decorative bg blobs */}
          <div className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-blue-500/10 dark:bg-blue-400/[0.07] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-indigo-500/8 dark:bg-indigo-400/[0.06] blur-3xl" />

          {/* Mobile drag handle */}
          <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-slate-300/80 dark:bg-slate-600/70" />

          {/* ── Row 1: Icon + name + close ── */}
          <div className="flex items-start gap-3.5 mt-2 md:mt-0">

            {/* Icon with glow ring */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/25 dark:bg-blue-400/15 blur-[10px] scale-110" />
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shadow-md bg-white dark:bg-slate-800">
                <img
                  src="/icons/icon-192x192.png"
                  alt="Pdfing Pro"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Name + meta */}
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
              {/* Stars */}
              <div className="flex items-center gap-0.5 mt-1.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
                <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">5.0</span>
              </div>
            </div>

            {/* Close */}
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

          {/* ── Row 3: Actions ── */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDismissClick}
              className="shrink-0 text-[12px] font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200"
            >
              Not now
            </button>

            <button
              onClick={handleInstallClick}
              disabled={promptState !== "idle"}
              aria-live="polite"
              className={`relative flex-1 flex items-center justify-center gap-2 text-[13px] font-bold text-white py-3 rounded-2xl overflow-hidden
                transition-all duration-300
                hover:scale-[1.015] active:scale-[0.98]
                disabled:cursor-not-allowed disabled:opacity-90
                ${promptState === "success"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_4px_16px_rgba(16,185,129,0.35)]"
                  : "bg-gradient-to-r from-[#1461bd] to-[#0b3e7b] hover:from-[#1e76e5] hover:to-[#1251a0] shadow-[0_4px_16px_rgba(20,97,189,0.30)] hover:shadow-[0_8px_24px_rgba(20,97,189,0.42)]"
                }
              `}
            >
              {/* Shimmer sweep (idle only) */}
              {promptState === "idle" && (
                <span
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.20) 50%, transparent 65%)",
                    backgroundSize: "200% 100%",
                    animation: "pwa-shimmer-btn 2.6s linear infinite",
                  }}
                />
              )}

              {promptState === "installing" && (
                <>
                  <span className="material-symbols-outlined !text-[17px] animate-spin">progress_activity</span>
                  Installing…
                </>
              )}

              {promptState === "success" && (
                <>
                  <span className="material-symbols-outlined !text-[17px] icon-filled">check_circle</span>
                  Installed! Enjoy 🎉
                </>
              )}

              {promptState === "idle" && (
                <>
                  <span className="material-symbols-outlined !text-[17px]">download</span>
                  Install — It&apos;s Free
                </>
              )}
            </button>
          </div>

          {/* Fine print */}
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-3 leading-relaxed">
            No app store needed · No sign-up · Works on Windows, Mac &amp; Android
          </p>
        </div>
      </div>

      {/* Injected keyframe for shimmer button */}
      <style>{`
        @keyframes pwa-shimmer-btn {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>
    </>
  );
}
