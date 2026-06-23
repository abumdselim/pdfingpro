"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import { heicFilesToPDF } from "@/lib/pdf/heic";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const HEIC_ACCEPT = {
  "image/heic": [".heic"],
  "image/heif": [".heif"],
};

export default function HeicToPdfPage() {
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
    accept: HEIC_ACCEPT,
    multiple: true,
  });

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    try {
      const bytes = await heicFilesToPDF(files);
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResult({
        blob,
        filename: files.length === 1 ? `${getBaseName(files[0].name)}.pdf` : "heic-images.pdf",
      });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("heicToPdf.error"));
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
    <ToolLayout title={t("tools.heicToPdf.title")} description={t("heicToPdf.pageDescription")} icon="photo_camera" iconClass="bg-violet-50 text-violet-600">
      {result ? (
        <ToolCard>
          <DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} />
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <div {...getRootProps()} className={cn("flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg py-10 cursor-pointer transition-all", isDragActive ? "border-teal-500 bg-teal-50 dark:bg-teal-950/20" : "border-slate-200 dark:border-slate-700 hover:border-teal-400")}>
              <input {...getInputProps()} />
              <span className="material-symbols-outlined text-slate-400 text-[40px]">photo_camera</span>
              <p className="font-medium text-slate-700 dark:text-slate-300">{t("heicToPdf.dropHere")}</p>
              <p className="text-sm text-slate-500">{t("heicToPdf.formats")}</p>
            </div>
          </ToolCard>
          {files.length > 0 && (
            <ToolCard>
              <p className="text-sm font-semibold mb-3">{t("heicToPdf.fileCount", { count: files.length })}</p>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mb-3">{error}</p>}
              <PrimaryButton onClick={handleConvert} loading={processing}>{t("heicToPdf.button")}</PrimaryButton>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
