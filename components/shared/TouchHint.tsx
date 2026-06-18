"use client";

import { useEffect, useState } from "react";
import { isTouchDevice } from "@/lib/touch-utils";
import { cn } from "@/lib/utils";

interface TouchHintProps {
  /** Context-specific hint text */
  text: string;
  /** Optional icon name (Material Symbols) */
  icon?: string;
  /** Show hint permanently or auto-hide after delay */
  persistent?: boolean;
  /** Auto-hide delay in ms (default: 4000) */
  autoHideDelay?: number;
  className?: string;
}

/**
 * Touch-first guidance component
 * Shows contextual hints above interactive areas
 */
export default function TouchHint({
  text,
  icon = "touch_app",
  persistent = false,
  autoHideDelay = 4000,
  className = "",
}: TouchHintProps) {
  const [visible, setVisible] = useState(true);
  const [isTouch] = useState(() => isTouchDevice());

  useEffect(() => {
    if (!persistent && visible) {
      const timer = setTimeout(() => setVisible(false), autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [persistent, visible, autoHideDelay]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/50 text-slate-800 text-xs font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-fade-in-up",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[16px] text-teal-600">
          {isTouch ? icon : "info"}
        </span>
      </div>
      <span className="drop-shadow-sm">{text}</span>
      {!persistent && (
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="ml-2 w-6 h-6 rounded-full hover:bg-slate-200/50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Dismiss hint"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      )}
    </div>
  );
}
