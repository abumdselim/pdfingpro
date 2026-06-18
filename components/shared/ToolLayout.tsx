"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: string;
  iconClass?: string;
  children: React.ReactNode;
}

export default function ToolLayout({
  title,
  description,
  icon,
  iconClass = "bg-teal-50 text-teal-600",
  children,
}: ToolLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-transparent pt-14">
      {/* Tool header */}
      <div className="relative z-10 animate-fade-in-up">
        <div className="max-w-3xl mx-auto px-6 py-12 text-center flex flex-col items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-full transition-colors mb-8"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {t("common.allTools")}
          </Link>

          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 mb-6 shadow-sm", iconClass)}>
            <span className="material-symbols-outlined text-[32px]">{icon}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-lg text-slate-500 mt-3 max-w-xl mx-auto leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Tool content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pb-20 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        {children}
      </main>
    </div>
  );
}

/* ── Shared card wrapper ── */
export function ToolCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("glass-panel rounded-2xl p-6 transition-all duration-300 hover:shadow-modern", className)}>
      {children}
    </div>
  );
}

/* ── Action button styles ── */
export function PrimaryButton({
  onClick,
  disabled,
  loading,
  children,
  className,
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white text-[15px] font-bold px-8 py-3.5 rounded-full shadow-md shadow-teal-500/20 hover:shadow-glow hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none",
        className
      )}
    >
      {loading && (
        <span className="material-symbols-outlined text-[20px] animate-spin">
          progress_activity
        </span>
      )}
      {children}
    </button>
  );
}

export function SecondaryButton({
  onClick,
  disabled,
  children,
  className,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 bg-white border border-slate-200/80 text-slate-700 text-[15px] font-bold px-8 py-3.5 rounded-full hover:bg-slate-50 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ── Progress bar ── */
export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        {label && <p className="text-sm font-medium text-slate-600">{label}</p>}
        <p className="text-sm font-bold text-teal-600 ml-auto">{Math.round(clamped)}%</p>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, #137ece, #3596ec)',
            boxShadow: '0 0 8px rgba(19,126,206,0.4)',
          }}
        />
      </div>
    </div>
  );
}

/* ── Download success state ── */
export function DownloadSuccess({
  onDownload,
  onReset,
  filename,
  sizeBytes,
}: {
  onDownload: () => void;
  onReset: () => void;
  filename?: string;
  sizeBytes?: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center animate-scale-in">
      {/* Glowing success icon */}
      <div className="relative">
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-teal-400/20 blur-xl animate-pulse" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-teal-50 to-teal-100 rounded-full flex items-center justify-center shadow-sm ring-4 ring-teal-100">
          <span className="material-symbols-outlined text-teal-600 icon-filled text-[40px]">
            check_circle
          </span>
        </div>
      </div>
      <div>
        <p className="font-extrabold text-slate-900 text-xl tracking-tight">{t("common.done")}</p>
        {filename && (
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            {filename}
            {sizeBytes !== undefined && (
              <span className="text-teal-600 ml-1.5">· {Math.round(sizeBytes / 1024)} KB</span>
            )}
          </p>
        )}
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={onDownload}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white text-[15px] font-bold px-8 py-3.5 rounded-full shadow-md shadow-teal-500/20 hover:shadow-[0_0_20px_rgba(19,126,206,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-[20px]">download</span>
          {t("common.download")}
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 bg-white border border-slate-200/80 text-slate-700 text-[15px] font-bold px-8 py-3.5 rounded-full hover:bg-slate-50 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          {t("common.startOver")}
        </button>
      </div>
    </div>
  );
}
