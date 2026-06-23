"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import { imagesToPDF } from "@/lib/pdf/convert";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const WEBP_ACCEPT = {
  "image/webp": [".webp"],
};

export default function WebpToPdfPage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted]);
    setResult(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: WEBP_ACCEPT,
    multiple: true,
  });

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    try {
      const bytes = await imagesToPDF(files);
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResult({
        blob,
        filename: files.length === 1 ? `${getBaseName(files[0].name)}.pdf` : "webp-images.pdf",
      });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("webpToPdf.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  return (
    <ToolLayout
      title={t("tools.webpToPdf.title")}
      description={t("webpToPdf.pageDescription")}
      icon="image"
      iconClass="bg-lime-50 text-lime-600"
    >
      {result ? (
        <ToolCard>
          <DownloadSuccess
            onDownload={() => downloadBlob(result.blob, result.filename)}
            onReset={reset}
            filename={result.filename}
          />
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg py-10 cursor-pointer transition-all",
                isDragActive
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-950/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900/40"
              )}
            >
              <input {...getInputProps()} />
              <span className="material-symbols-outlined text-slate-400 text-[40px]">image</span>
              <div className="text-center">
                <p className="font-medium text-slate-700 dark:text-slate-300">{t("webpToPdf.dropHere")}</p>
                <p className="text-sm text-slate-500 mt-0.5">{t("webpToPdf.formats")}</p>
              </div>
            </div>
          </ToolCard>

          {files.length > 0 && (
            <ToolCard>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                {t("webpToPdf.imageCount", { count: files.length })}
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-4 max-h-32 overflow-auto">
                {files.map((file) => (
                  <li key={file.name + file.size}>{file.name}</li>
                ))}
              </ul>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded mb-3">
                  {error}
                </p>
              )}
              <PrimaryButton onClick={handleConvert} loading={processing}>
                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                {t("webpToPdf.button")}
              </PrimaryButton>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
