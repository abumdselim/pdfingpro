"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { pdfToPowerPoint } from "@/lib/pdf/pdftopptx";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function PdfToPowerPointPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setProgress("");
    try {
      const buffer = await file.arrayBuffer();
      const blob = await pdfToPowerPoint(buffer, (page, total) => {
        setProgress(t("pdfToPowerpoint.progress", { current: page, total }));
      });
      setResult({ blob, filename: `${getBaseName(file.name)}.pptx` });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("pdfToPowerpoint.error"));
    } finally {
      setProcessing(false);
      setProgress("");
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <ToolLayout
      title={t("tools.pdfToPowerpoint.title")}
      description={t("pdfToPowerpoint.pageDescription")}
      icon="slideshow"
      iconClass="bg-orange-50 text-orange-600"
    >
      <div className="space-y-4">
        <ToolCard>
          <FileDropzone
            onFiles={(files) => {
              setFile(files[0]);
              setResult(null);
              setError(null);
            }}
            files={file ? [file] : []}
          />
        </ToolCard>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/50 rounded text-sm text-amber-700 dark:text-amber-300">
          <p className="font-semibold mb-1">{t("pdfToPowerpoint.limitations")}</p>
          <p>{t("pdfToPowerpoint.limitationsBody")}</p>
        </div>

        {result ? (
          <ToolCard>
            <DownloadSuccess
              onDownload={() => downloadBlob(result.blob, result.filename)}
              onReset={reset}
              filename={result.filename}
            />
          </ToolCard>
        ) : (
          file && (
            <ToolCard>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded mb-4">
                  {error}
                </p>
              )}
              {progress && <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{progress}</p>}
              <PrimaryButton onClick={handleConvert} loading={processing}>
                <span className="material-symbols-outlined text-[18px]">slideshow</span>
                {t("pdfToPowerpoint.button")}
              </PrimaryButton>
            </ToolCard>
          )
        )}
      </div>
    </ToolLayout>
  );
}
