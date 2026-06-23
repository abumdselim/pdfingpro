"use client";

import { useCallback, type MouseEvent } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { cn, formatBytes } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { ui } from "@/lib/theme/ui";

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  onRemove?: (index: number) => void;
  accept?: Accept;
  maxFiles?: number;
  files?: File[];
  label?: string;
  sublabel?: string;
  sectionLabel?: string;
  className?: string;
}

export default function FileDropzone({
  onFiles,
  onRemove,
  accept = { "application/pdf": [".pdf"] },
  maxFiles = 1,
  files = [],
  label,
  sublabel,
  sectionLabel,
  className,
}: FileDropzoneProps) {
  const { t } = useTranslation();
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFiles(accepted);
    },
    [onFiles]
  );

  const handleRemove = useCallback(
    (e: MouseEvent, index: number) => {
      e.stopPropagation();
      e.preventDefault();
      if (onRemove) {
        onRemove(index);
      } else if (maxFiles === 1) {
        onFiles([]);
      } else {
        onFiles(files.filter((_, idx) => idx !== index));
      }
    },
    [onRemove, maxFiles, onFiles, files]
  );

  const hasFiles = files.length > 0;
  const extensions = Object.values(accept).flat();
  const acceptHint = extensions.join(", ").toUpperCase();

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    multiple: maxFiles !== 1,
    noClick: hasFiles,
    noKeyboard: hasFiles,
  });

  const resolvedLabel = label ?? t("common.dropPdfHere");
  const resolvedSublabel =
    sublabel ??
    (maxFiles > 1 ? t("common.orClickToSelectMultiple", { max: maxFiles }) : t("common.orClickToSelect"));

  return (
    <div className={cn("file-dropzone-section", className)}>
      {sectionLabel && <p className={cn("mb-2.5", ui.sectionLabel)}>{sectionLabel}</p>}

      <div
        {...getRootProps()}
        className={cn(
          "file-dropzone-root group relative cursor-pointer overflow-hidden rounded-lg border-2 border-dotted transition-all duration-200 select-none",
          isDragActive
            ? "border-[#1461bd] bg-[#1461bd]/[0.06] dark:border-teal-500 dark:bg-teal-950/25"
            : "border-[#1461bd]/45 bg-slate-50/50 hover:border-[#1461bd]/70 hover:bg-[#1461bd]/[0.03] dark:border-teal-500/45 dark:bg-slate-900/20 dark:hover:border-teal-400/70 dark:hover:bg-teal-950/20",
          hasFiles ? "p-4 sm:p-5" : "px-6 py-14 sm:py-16 min-h-[220px] sm:min-h-[240px]"
        )}
      >
        <input {...getInputProps()} />

        {!hasFiles ? (
          <div className="flex flex-col items-center justify-center gap-5 text-center">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-white transition-colors dark:bg-slate-900",
                isDragActive
                  ? "border-[#1461bd]/40 text-[#1461bd] dark:border-teal-500/50 dark:text-teal-400"
                  : "border-slate-200 text-slate-500 group-hover:border-slate-300 group-hover:text-[#1461bd] dark:border-slate-700 dark:text-slate-400 dark:group-hover:border-slate-600 dark:group-hover:text-teal-400"
              )}
            >
              <span className="material-symbols-outlined text-[28px]">upload_file</span>
            </div>

            <div className="max-w-sm">
              <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">{resolvedLabel}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{resolvedSublabel}</p>
            </div>

            {acceptHint && (
              <span className="rounded-md border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-semibold tracking-wide text-slate-400 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-500">
                {acceptHint}
              </span>
            )}
          </div>
        ) : (
          <div className="w-full max-w-lg mx-auto space-y-2.5">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 dark:border-slate-700/80 dark:bg-slate-900/60"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{f.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">{formatBytes(f.size)}</p>
                </div>
                <button
                  type="button"
                  aria-label={t("common.removeFile")}
                  onClick={(e) => handleRemove(e, i)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
            <button
              type="button"
              className="w-full pt-1 text-center text-xs font-medium text-slate-400 transition-colors hover:text-[#1461bd] dark:hover:text-teal-400"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              {t("common.clickOrDropToReplace")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
