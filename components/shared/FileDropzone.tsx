"use client";

import { useCallback } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { cn, formatBytes } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: Accept;
  maxFiles?: number;
  files?: File[];
  label?: string;
  sublabel?: string;
  className?: string;
}

export default function FileDropzone({
  onFiles,
  accept = { "application/pdf": [".pdf"] },
  maxFiles = 1,
  files = [],
  label,
  sublabel,
  className,
}: FileDropzoneProps) {
  const { t } = useTranslation();
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFiles(accepted);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    multiple: maxFiles !== 1,
  });

  const hasFiles = files.length > 0;
  const resolvedLabel = label ?? t("common.dropPdfHere");

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-5 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-500 select-none overflow-hidden",
        isDragActive
          ? "border-teal-500 bg-teal-50/50 scale-[0.99] shadow-inner"
          : "border-slate-300/80 bg-slate-50/30 hover:border-teal-400 hover:bg-teal-50/20 hover:shadow-sm",
        hasFiles ? "py-8" : "py-20",
        className
      )}
    >
      {/* Decorative gradient blur in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-teal-400/5 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-400/10 transition-colors duration-500" />

      <input {...getInputProps()} />

      {!hasFiles ? (
        <>
          <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-sm relative z-10 group-hover:-translate-y-1",
            isDragActive ? "bg-teal-500 text-white shadow-teal-500/30" : "bg-white text-slate-400 group-hover:text-teal-600"
          )}>
            <span className={cn(
              "material-symbols-outlined text-[36px] transition-transform duration-500 group-hover:scale-110",
              isDragActive ? "" : ""
            )}>
              cloud_upload
            </span>
          </div>
          <div className="text-center px-4 relative z-10">
            <p className="text-lg font-bold text-slate-800">{resolvedLabel}</p>
            <p className="text-sm font-medium text-slate-500 mt-1.5">
              {sublabel ?? (maxFiles > 1
                ? t("common.orClickToSelectMultiple", { max: maxFiles })
                : t("common.orClickToSelect"))}
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-400/80 bg-white border border-slate-200/60 px-4 py-1.5 rounded-full shadow-sm relative z-10">
            {Object.values(accept).flat().join(", ")}
          </div>
        </>
      ) : (
        <div className="w-full max-w-lg mx-auto px-6 space-y-2 relative z-10">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-4 text-sm p-3 bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-slate-800 font-semibold">{f.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(f.size)}</p>
              </div>
              <div className="w-8 h-8 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </div>
            </div>
          ))}
          <p className="text-xs font-medium text-slate-400 pt-4 text-center">
            {t("common.clickOrDropToReplace")}
          </p>
        </div>
      )}
    </div>
  );
}
