"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Check if the app has been recently dismissed by the user (e.g., in the last 7 days)
    const dismissedTime = localStorage.getItem("pwa-install-prompt-dismissed");
    if (dismissedTime) {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - Number(dismissedTime) < sevenDays) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar or default browser prompt from appearing
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the custom installation banner
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      // Clear the deferred prompt and hide the custom banner if already installed
      setDeferredPrompt(null);
      setShowPrompt(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native browser installation prompt
    await deferredPrompt.prompt();

    // Wait for the user's choice
    const { outcome } = await deferredPrompt.userChoice;
    
    // Clear the saved prompt since it can only be used once
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismissClick = () => {
    // Remember the user's dismissal for 7 days
    localStorage.setItem("pwa-install-prompt-dismissed", Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[380px] z-50 transition-all duration-500 ease-out transform ${
        showPrompt ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
      }`}
    >
      <div className="glass-panel shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-4 rounded-2xl flex flex-col gap-3.5 border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        
        {/* App details row */}
        <div className="flex items-start gap-3">
          {/* App Icon */}
          <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden shadow-md bg-white p-1 border border-slate-100 dark:border-slate-800/80 flex items-center justify-center">
            <img
              src="/icons/icon-192x192.png"
              alt="Pdfing Pro Logo"
              className="w-10 h-10 object-contain rounded-lg"
            />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[15px] leading-tight">
              Pdfing Pro
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              Install in one click for instant offline access and native desktop shortcuts.
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismissClick}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 -mt-1 -mr-1"
            aria-label="Dismiss install prompt"
          >
            <span className="material-symbols-outlined !text-[18px]">close</span>
          </button>
        </div>

        {/* Buttons row */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={handleDismissClick}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200"
          >
            Maybe later
          </button>
          
          <button
            onClick={handleInstallClick}
            className="text-xs font-semibold text-white px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-[#1461bd] to-[#0b3e7b] hover:from-[#1e76e5] hover:to-[#0f54a8] shadow-[0_4px_12px_rgba(20,97,189,0.2)] hover:shadow-[0_6px_16px_rgba(20,97,189,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined !text-[16px]">download</span>
            Install in one click
          </button>
        </div>
      </div>
    </div>
  );
}
