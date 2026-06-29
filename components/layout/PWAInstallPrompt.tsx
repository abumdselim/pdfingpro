
"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type PromptState = "idle" | "installing" | "success";
type BannerMode = "native" | "ios" | "desktop-manual";
type DesktopBrowser = "chrome" | "edge" | "firefox" | "safari" | "opera" | "samsung" | "unknown";

const FEATURES = [
  { icon: "offline_bolt", label: "Works offline" },
  { icon: "speed", label: "Instant launch" },
  { icon: "lock", label: "100% private" },
];

const STORAGE_DISMISS = "pwa-install-prompt-dismissed"; // hard dismiss (7 days)
const STORAGE_SNOOZE = "pwa-install-prompt-snoozed"; // soft snooze (24h)
const HARD_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
const SNOOZE_MS = 24 * 60 * 60 * 1000;

/* ─────────────────────────────────────────────────────────────────────
 *  Device / browser detection
 * ──────────────────────────────────────────────────────────────────── */

function getNavigator(): NavigatorWithMeta | null {
  if (typeof navigator === "undefined") return null;
  return navigator as NavigatorWithMeta;
}

/** Mobile / tablet */
function isMobileUA() {
  const n = getNavigator();
  if (!n) return false;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(
    n.userAgent,
  );
}

/** iOS / iPadOS — handles iPadOS 13+ which reports as Mac */
function isAppleMobile() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;

  // Classic iPhone/iPad/iPod
  if (/iphone|ipad|ipod/i.test(ua)) return true;

  // iPadOS 13+ disguises as Mac. We look for: MacIntel + maxTouchPoints > 0
  // (iPads have multi-touch) + no "Mozilla" misspelling tricks. Safari only.
  const isMac = /Macintosh|Mac OS X/.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPiOS|OPT/i.test(ua);
  if (isMac && isSafari && navigator.maxTouchPoints > 1) return true;

  return false;
}

/** Already-installed (standalone / fullscreen / TWA) */
function isStandalone() {
  if (typeof window === "undefined") return false;
  const n = getNavigator();
  const standalone = n && (n as NavigatorWithMeta).standalone === true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    standalone === true
  );
}

/** Coarse OS detection */
function detectOS(): "ios" | "android" | "windows" | "macos" | "linux" | "unknown" {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;

  if (isAppleMobile()) return "ios";

  if (/android/i.test(ua)) return "android";
  if (/windows nt/i.test(ua)) return "windows";
  if (/mac os x/i.test(ua) && !/iphone|ipad|ipod/i.test(ua)) return "macos";
  if (/linux/i.test(ua)) return "linux";
  return "unknown";
}

/** Identify the desktop browser so we can give accurate manual instructions */
function detectDesktopBrowser(): DesktopBrowser {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;

  if (/edg\//i.test(ua)) return "edge";
  if (/opr\//i.test(ua)) return "opera";
  if (/samsungbrowser/i.test(ua)) return "samsung";
  if (/firefox|fxios/i.test(ua)) return "firefox";
  if (/chrome|crios/i.test(ua)) return "chrome";
  if (/safari/i.test(ua) && !/chrome|crios|fxios|edgios|opios|opt/i.test(ua)) return "safari";
  return "unknown";
}

/* ─────────────────────────────────────────────────────────────────────
 *  Component
 * ──────────────────────────────────────────────────────────────────── */

interface NavigatorWithMeta extends Navigator {
  standalone?: boolean;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [visible, setVisible] = useState(false);
  const [promptState, setPromptState] = useState<PromptState>("idle");
  const [bannerMode, setBannerMode] = useState<BannerMode | null>(null);
  const [desktopBrowser, setDesktopBrowser] = useState<DesktopBrowser>("unknown");
  const [armed, setArmed] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doHide = useCallback((extraDelay = 0) => {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowPrompt(false), 450 + extraDelay);
  }, []);

  /* ── 1. Listen for the native Android/Chromium prompt ── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Some browsers refresh the eligibility check; never pre-empt.
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setBannerMode("native");
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      setVisible(false);
      try {
        localStorage.removeItem(STORAGE_DISMISS);
        localStorage.removeItem(STORAGE_SNOOZE);
      } catch {}
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Detect when the running session becomes standalone (e.g. iOS Add-to-Home)
    const standaloneMql = window.matchMedia("(display-mode: standalone)");
    const onMqlChange = () => {
      if (standaloneMql.matches) handleAppInstalled();
    };
    standaloneMql.addEventListener("change", onMqlChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      standaloneMql.removeEventListener("change", onMqlChange);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /* ── 2. Decide which fallback banner (if any) to surface ── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isStandalone()) return;

    // Respect prior dismiss / snooze
    const now = Date.now();
    try {
      const dismissedAt = Number(localStorage.getItem(STORAGE_DISMISS));
      if (dismissedAt && now - dismissedAt < HARD_DISMISS_MS) return;
      const snoozedAt = Number(localStorage.getItem(STORAGE_SNOOZE));
      if (snoozedAt && now - snoozedAt < SNOOZE_MS) return;
    } catch {}

    const os = detectOS();

    // iOS still gets an iOS guide even if beforeinstallprompt exists.
    if (os === "ios") {
      setBannerMode("ios");
      return;
    }

    // For ALL other platforms (Android mobile, any desktop browser):
    // - Default to "desktop-manual" so a card is always visible, with
    //   browser-specific copy (Chrome/Edge get different instructions
    //   from Safari/Firefox).
    // - The `beforeinstallprompt` listener (Effect 1) will flip the mode
    //   to "native" for Android / Chrome / Edge once it's eligible — at
    //   which point the banner becomes the install-CTA version.
    if (!isMobileUA()) {
      const browser = detectDesktopBrowser();
      setDesktopBrowser(browser);
      setBannerMode("desktop-manual");
    } else if (os === "android") {
      // Android: wait for beforeinstallprompt before showing anything.
      setBannerMode("native");
    }
  }, []);

  /* ── 3. Engagement gate: arm after first interaction, scroll past 20% vh,
   *     or 8s elapsed — whichever comes first. ── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!bannerMode || armed) return;

    let fired = false;
    const arm = () => {
      if (fired) return;
      fired = true;
      setArmed(true);
    };

    const interactEvents: Array<keyof DocumentEventMap> = [
      "click",
      "touchstart",
      "keydown",
    ];

    const onInteract = () => arm();
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.2) arm();
    };

    // Auto-arm after 8s no matter what (gentle fallback so users still see it)
    const fallback = setTimeout(arm, 8_000);
    window.addEventListener("scroll", onScroll, { passive: true });
    interactEvents.forEach((evt) =>
      window.addEventListener(evt, onInteract, { passive: true, once: true }),
    );

    return () => {
      clearTimeout(fallback);
      window.removeEventListener("scroll", onScroll);
      interactEvents.forEach((evt) => window.removeEventListener(evt, onInteract));
    };
  }, [bannerMode, armed]);

  /* ── 4. When armed + we have content → open the banner ── */
  useEffect(() => {
    if (!bannerMode || !armed) return;
    // For native (Android / Chromium): only show once we actually hold the
    // deferred event — the browser itself governs eligibility.
    if (bannerMode === "native" && !deferredPrompt) return;

    setShowPrompt(true);
    timerRef.current = setTimeout(
      () => setVisible(true),
      bannerMode === "native" ? 80 : 200,
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [bannerMode, deferredPrompt, armed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt || promptState !== "idle") return;
    setPromptState("installing");
    try {
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
    } catch {
      setPromptState("idle");
    }
  };

  const handleDismissClick = () => {
    try {
      localStorage.setItem(STORAGE_DISMISS, Date.now().toString());
    } catch {}
    doHide();
  };

  const handleSnoozeClick = () => {
    try {
      localStorage.setItem(STORAGE_SNOOZE, Date.now().toString());
    } catch {}
    doHide();
  };

  if (!showPrompt || !bannerMode) return null;

  /* ─── iOS guide ────────────────────────────────────────────────── */
  if (bannerMode === "ios") {
    return (
      <IOSBanner
        visible={visible}
        onClose={handleDismissClick}
        onSnooze={handleSnoozeClick}
      />
    );
  }

  /* ─── Desktop manual install guide (Firefox / Safari) ──────────── */
  if (bannerMode === "desktop-manual") {
    return (
      <DesktopManualBanner
        visible={visible}
        browser={desktopBrowser}
        onClose={handleDismissClick}
        onSnooze={handleSnoozeClick}
      />
    );
  }

  /* ─── Native Android / Chromium banner ─────────────────────────── */
  return (
    <NativeBanner
      visible={visible}
      promptState={promptState}
      onInstall={handleInstallClick}
      onClose={handleDismissClick}
      onSnooze={handleSnoozeClick}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Sub-components
 * ═══════════════════════════════════════════════════════════════════ */

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 -mr-1 -mt-0.5"
      aria-label="Dismiss"
    >
      <span className="material-symbols-outlined !text-[18px]">close</span>
    </button>
  );
}

function HeaderRow() {
  return (
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
          <span className="font-bold text-[15px] text-slate-900 dark:text-white">
            Pdfing Pro
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-gradient-to-r from-[#1461bd] to-[#0b3e7b] px-1.5 py-0.5 rounded-full">
            Free
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Add to your Home Screen
        </p>
      </div>
    </div>
  );
}

function FeaturePills() {
  return (
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
  );
}

function Backdrop({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-40 bg-black/10 dark:bg-black/25 backdrop-blur-[2px] md:hidden transition-opacity duration-400 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

/* ── iOS sheet ─────────────────────────────────────────────────────── */
function IOSBanner({
  visible,
  onClose,
  onSnooze,
}: {
  visible: boolean;
  onClose: () => void;
  onSnooze: () => void;
}) {
  return (
    <>
      <Backdrop visible={visible} onClick={onClose} />

      <div
        role="dialog"
        aria-label="Install Pdfing Pro on iOS"
        className={`fixed z-50 bottom-0 left-0 right-0 transition-all duration-[420ms] ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        <div
          className="
            relative overflow-hidden rounded-t-3xl
            bg-white/[0.97] dark:bg-slate-900/[0.97]
            border-t border-x border-slate-200/70 dark:border-slate-700/60
            shadow-[0_-8px_40px_rgba(0,0,0,0.10)]
            dark:shadow-[0_-8px_40px_rgba(0,0,0,0.40)]
            backdrop-blur-xl
            px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]
          "
        >
          <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-indigo-500/8 blur-3xl" />

          {/* Drag handle */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-slate-300/80 dark:bg-slate-600/70" />

          <div className="flex items-center justify-between mb-4">
            <HeaderRow />
            <CloseButton onClick={onClose} />
          </div>

          <div className="space-y-2.5">
            {/* Step 1 */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-[#1461bd]/10 dark:bg-[#1461bd]/20 flex items-center justify-center">
                <span className="text-[13px] font-black text-[#1461bd]">1</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">
                  Tap the Share button
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Tap{" "}
                  <span className="inline-flex items-center gap-0.5 font-medium text-[#1461bd] dark:text-blue-400">
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                    </svg>
                    Share
                  </span>{" "}
                  at the bottom of your browser
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-[#1461bd]/10 dark:bg-[#1461bd]/20 flex items-center justify-center">
                <span className="text-[13px] font-black text-[#1461bd]">2</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">
                  Tap &ldquo;Add to Home Screen&rdquo;
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Scroll down in the share sheet and tap this option
                </p>
              </div>
              <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-slate-700/60 flex items-center justify-center">
                <span className="material-symbols-outlined !text-[15px] text-slate-500 dark:text-slate-400 icon-filled">
                  add_box
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#1461bd]/8 to-[#0b3e7b]/8 dark:from-[#1461bd]/15 dark:to-[#0b3e7b]/15 border border-[#1461bd]/15 dark:border-[#1461bd]/25">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-[#1461bd]/15 dark:bg-[#1461bd]/25 flex items-center justify-center">
                <span className="text-[13px] font-black text-[#1461bd]">3</span>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">
                  Tap &ldquo;Add&rdquo; to confirm
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  The app will appear on your Home Screen ✓
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={onSnooze}
              className="flex-1 text-center text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors duration-200"
            >
              Remind me tomorrow
            </button>
            <button
              onClick={onClose}
              className="flex-1 text-center text-[12px] font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 py-2 rounded-xl transition-colors duration-200"
            >
              Got it
            </button>
          </div>
        </div>
      </div>

      {/* Pointer (mobile only). Anchor to 25% from bottom – keeps clear of
          iOS Safari bottom toolbar. */}
      <div
        className={`md:hidden fixed z-50 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-500 delay-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 30vh)" }}
      >
        <div className="flex flex-col items-center gap-1">
          <p className="text-[11px] font-semibold text-white bg-slate-900/80 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
            Tap{" "}
            <svg
              className="inline w-3 h-3 mx-0.5 -mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>{" "}
            Share below
          </p>
          <svg
            className="w-4 h-4 text-slate-900 dark:text-slate-100 drop-shadow-sm"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 20l-8-12h16z" />
          </svg>
        </div>
      </div>
    </>
  );
}

/* ── Desktop manual install banner ────────────────────────────────── */
function DesktopManualBanner({
  visible,
  browser,
  onClose,
  onSnooze,
}: {
  visible: boolean;
  browser: DesktopBrowser;
  onClose: () => void;
  onSnooze: () => void;
}) {
  const instructions = getDesktopManualInstructions(browser);

  return (
    <>
      <Backdrop visible={visible} onClick={onClose} />

      <div
        role="dialog"
        aria-label="Install Pdfing Pro on your computer"
        className={`fixed z-50 bottom-6 right-6 left-6 md:left-auto md:w-[420px] transition-all duration-[420ms] ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        <div
          className="
            relative overflow-hidden rounded-3xl
            bg-white/[0.97] dark:bg-slate-900/[0.97]
            border border-slate-200/70 dark:border-slate-700/60
            shadow-[0_-8px_40px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.04)]
            dark:shadow-[0_-8px_40px_rgba(0,0,0,0.40),0_2px_8px_rgba(0,0,0,0.25)]
            backdrop-blur-xl p-5
          "
        >
          <div className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-blue-500/10 dark:bg-blue-400/[0.07] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-indigo-500/8 dark:indigo-400/[0.06] blur-3xl" />

          <div className="flex items-start gap-3.5">
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
                {instructions.headline}
              </p>
            </div>

            <CloseButton onClick={onClose} />
          </div>

          <FeaturePills />

          {/* Manual steps */}
          <div className="mt-4 space-y-1.5">
            {instructions.steps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-[12px] text-slate-700 dark:text-slate-300"
              >
                <span className="shrink-0 w-5 h-5 rounded-md bg-[#1461bd]/10 dark:bg-[#1461bd]/20 text-[#1461bd] dark:text-blue-400 font-bold text-[10px] flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p
                  className="leading-snug"
                  // Each step's HTML contains inline `<kbd>` etc.
                  dangerouslySetInnerHTML={{ __html: step }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={onSnooze}
              className="flex-1 text-center text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors duration-200"
            >
              Remind me tomorrow
            </button>
            <button
              onClick={onClose}
              className="flex-1 text-center text-[12px] font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 py-2 rounded-xl transition-colors duration-200"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function getDesktopManualInstructions(browser: DesktopBrowser): {
  headline: string;
  steps: string[];
} {
  switch (browser) {
    case "firefox":
      return {
        headline: "Add Pdfing Pro to your desktop in 3 quick steps",
        steps: [
          "Look for the <strong>install icon</strong> in the address bar (or tap the <kbd>⋮</kbd> menu).",
          "Click <strong>Install</strong> and confirm the prompt.",
          "A standalone window will launch — find Pdfing Pro on your desktop or in your apps list.",
        ],
      };
    case "safari":
      return {
        headline: "Add Pdfing Pro to your Dock",
        steps: [
          'Open the <strong>Share</strong> menu (the square with the arrow at the top of the toolbar).',
          'Choose <strong>Add to Dock</strong> (or "Add to Home Screen" on iPad).',
          "Launch from your Dock — it runs offline and feels like a native app.",
        ],
      };
    default:
      return {
        headline: "Install Pdfing Pro for offline + 1-tap access",
        steps: [
          'Open the browser <strong>menu (⋮ / ⋯)</strong> at the top right.',
          'Choose <strong>Install app</strong>, <strong>Install Pdfing Pro</strong>, or <strong>Add to desktop</strong>.',
          "Confirm the install dialog — a shortcut is created that launches the full app.",
        ],
      };
  }
}

/* ── Native (Android / Chromium desktop) banner ─────────────────── */
function NativeBanner({
  visible,
  promptState,
  onInstall,
  onClose,
  onSnooze,
}: {
  visible: boolean;
  promptState: PromptState;
  onInstall: () => void;
  onClose: () => void;
  onSnooze: () => void;
}) {
  return (
    <>
      <Backdrop visible={visible} onClick={onClose} />

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
        <div
          className="
            relative overflow-hidden
            rounded-t-3xl md:rounded-3xl
            bg-white/[0.97] dark:bg-slate-900/[0.97]
            border border-slate-200/70 dark:border-slate-700/60
            shadow-[0_-8px_40px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.04)]
            dark:shadow-[0_-8px_40px_rgba(0,0,0,0.40),0_2px_8px_rgba(0,0,0,0.25)]
            backdrop-blur-xl
            p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]
            md:pb-5
          "
        >
          <div className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-blue-500/10 dark:bg-blue-400/[0.07] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-indigo-500/8 dark:indigo-400/[0.06] blur-3xl" />

          <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-slate-300/80 dark:bg-slate-600/70" />

          {/* Row 1 */}
          <div className="flex items-start gap-3.5 mt-2 md:mt-0">
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
                  <svg
                    key={i}
                    className="w-3 h-3 text-amber-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">5.0</span>
              </div>
            </div>

            <CloseButton onClick={onClose} />
          </div>

          <FeaturePills />

          <div className="my-4 h-px bg-slate-100 dark:bg-slate-800" />

          {/* Install CTA */}
          <button
            onClick={onInstall}
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
                  background:
                    "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: "pwa-shimmer-btn 2.8s linear infinite",
                }}
              />
            )}

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
                  promptState === "success"
                    ? "bg-white/20"
                    : "bg-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.20)]"
                }`}
              >
                {promptState === "installing" && (
                  <span className="material-symbols-outlined !text-[18px] text-white animate-spin">
                    progress_activity
                  </span>
                )}
                {promptState === "success" && (
                  <span className="material-symbols-outlined !text-[18px] text-white icon-filled">
                    check_circle
                  </span>
                )}
                {promptState === "idle" && (
                  <span className="material-symbols-outlined !text-[18px] text-white">
                    download
                  </span>
                )}
              </div>
              <div className="text-left">
                <div className="text-[14px] font-bold text-white leading-tight">
                  {promptState === "installing"
                    ? "Installing…"
                    : promptState === "success"
                      ? "Installed!"
                      : "Install App"}
                </div>
                <div className="text-[11px] text-white/70 font-medium leading-tight">
                  {promptState === "success"
                    ? "Enjoy Pdfing Pro 🎉"
                    : "Free · No sign-up required"}
                </div>
              </div>
            </div>

            {promptState === "idle" && (
              <span className="material-symbols-outlined !text-[20px] text-white/60 shrink-0">
                chevron_right
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={onSnooze}
              className="flex-1 text-center text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-1.5 transition-colors duration-200"
            >
              Remind me tomorrow
            </button>
            <button
              onClick={onClose}
              className="flex-1 text-center text-[12px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 py-1.5 transition-colors duration-200"
            >
              Not now
            </button>
          </div>
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
