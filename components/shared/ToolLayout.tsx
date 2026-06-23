"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { ui, withDarkIcon } from "@/lib/theme/ui";
import ProcessingBadge, { ProcessingChip, ProcessingDivider } from "@/components/shared/ProcessingBadge";
import { useToolProcessingTier } from "@/lib/hooks/useToolProcessingTier";
import type { ProcessingTier } from "@/lib/tool-processing";

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: string;
  iconClass?: string;
  processingTier?: ProcessingTier;
  children: React.ReactNode;
}

export default function ToolLayout({
  title,
  description,
  icon,
  iconClass = ui.iconBadge,
  processingTier,
  children,
}: ToolLayoutProps) {
  const { t } = useTranslation();
  const tier = useToolProcessingTier(processingTier);

  return (
    <div className="min-h-[calc(100dvh-var(--app-header-total))] flex flex-col pt-[var(--app-header-total)] md:pt-14">
      <main className="flex-1 w-full max-w-3xl mx-auto px-5 sm:px-8 py-6 sm:py-8 pb-24 animate-fade-in-up">
        <Link href="/" className={ui.backLink}>
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {t("common.allTools")}
        </Link>

        <div className="mt-6 sm:mt-7">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
                ui.border,
                withDarkIcon(iconClass)
              )}
            >
              <span className="material-symbols-outlined text-[26px]">{icon}</span>
            </div>
            <h1 className={cn("text-xl sm:text-2xl font-semibold tracking-tight leading-tight", ui.heading)}>
              {title}
            </h1>
          </div>

          <div className="mt-3.5">
            <ProcessingBadge tier={tier} />
          </div>

          <p className="mt-3.5 text-xs sm:text-sm leading-relaxed max-w-2xl text-slate-900 dark:text-slate-100">
            {description}
          </p>
        </div>

        <div className="mt-6 sm:mt-7 space-y-5">{children}</div>
      </main>
    </div>
  );
}

export function ToolUploadCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("file-upload-block", className)}>{children}</div>;
}

export function ToolCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("tool-panel rounded-xl p-5 sm:p-6", className)}>{children}</section>
  );
}

export function ToolCardHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 pb-5 border-b border-slate-200/70 dark:border-slate-800/70", className)}>
      <p className={cn("text-[15px] font-semibold", ui.subheading)}>{title}</p>
      {description && <p className={cn("mt-1 text-sm leading-relaxed", ui.muted)}>{description}</p>}
    </div>
  );
}

export function ToolActions({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  onClick,
  disabled,
  loading,
  children,
  className,
  privacyBadge = true,
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  privacyBadge?: boolean | ProcessingTier;
}) {
  const pathTier = useToolProcessingTier();
  const resolvedTier = typeof privacyBadge === "string" ? privacyBadge : pathTier;
  const showBadge = privacyBadge !== false;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex min-h-[2.75rem] w-full sm:w-auto items-center justify-center",
        showBadge ? "gap-0 pl-2 pr-6 py-2" : "gap-2.5 px-7 py-2.5",
        "rounded-lg bg-[#1461bd] text-white text-sm font-semibold tracking-wide",
        "shadow-md shadow-[#1461bd]/15",
        "hover:bg-[#1254a8] hover:shadow-lg hover:shadow-[#1461bd]/20",
        "active:translate-y-px",
        "transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:active:translate-y-0",
        "dark:bg-teal-600 dark:hover:bg-teal-500 dark:shadow-teal-600/15",
        className
      )}
    >
      {showBadge && <ProcessingChip tier={resolvedTier} />}
      {showBadge && <ProcessingDivider />}
      <span className={cn("primary-button-action inline-flex items-center gap-2.5", !showBadge && "gap-2.5")}>
        {loading && (
          <span className="material-symbols-outlined btn-icon-orb animate-spin btn-icon-glyph">progress_activity</span>
        )}
        {children}
      </span>
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
        "inline-flex min-h-[2.75rem] w-full sm:w-auto items-center justify-center gap-2.5 rounded-lg border px-7 py-2.5",
        "bg-white dark:bg-slate-900 text-sm font-semibold",
        ui.border,
        "text-slate-700 dark:text-slate-200 shadow-sm",
        "hover:bg-slate-50 dark:hover:bg-slate-800",
        "active:translate-y-px transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0",
        className
      )}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        {label && <p className={cn("text-sm font-medium", ui.body)}>{label}</p>}
        <p className="text-sm font-semibold text-[#1461bd] dark:text-teal-400 ml-auto tabular-nums">
          {Math.round(clamped)}%
        </p>
      </div>
      <div className={ui.progressTrack}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#1461bd] to-[#3596ec] dark:from-teal-600 dark:to-teal-400 transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

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
    <div className="flex flex-col items-center gap-6 py-8 sm:py-10 text-center animate-scale-in">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-emerald-400/15 blur-xl" aria-hidden />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/40">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 icon-filled text-[32px]">
            check_circle
          </span>
        </div>
      </div>
      <div>
        <p className={cn("font-semibold text-xl tracking-tight", ui.heading)}>{t("common.done")}</p>
        {filename && (
          <p className={cn("text-sm mt-2 font-medium", ui.muted)}>
            {filename}
            {sizeBytes !== undefined && (
              <span className="text-[#1461bd] dark:text-teal-400 ml-1.5 tabular-nums">
                · {Math.round(sizeBytes / 1024)} KB
              </span>
            )}
          </p>
        )}
      </div>
      <ToolActions className="justify-center w-full max-w-sm mx-auto">
        <button
          onClick={onDownload}
          className={cn(
            "inline-flex min-h-[2.75rem] flex-1 items-center justify-center gap-2 rounded-lg px-6 py-2.5",
            "bg-[#1461bd] text-white text-sm font-semibold shadow-md shadow-[#1461bd]/15",
            "hover:bg-[#1254a8] transition-all duration-200",
            "dark:bg-teal-600 dark:hover:bg-teal-500"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          {t("common.download")}
        </button>
        <SecondaryButton onClick={onReset} className="flex-1">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          {t("common.startOver")}
        </SecondaryButton>
      </ToolActions>
    </div>
  );
}
