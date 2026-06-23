"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess, ProgressBar } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { invertPdf } from "@/lib/pdf/filters";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function InvertPdfPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setError(null);
    try {
      const bytes = await invertPdf(await file.arrayBuffer(), (page, total) => {
        setProgress(Math.round((page / total) * 100));
      });
      setResult({
        blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
        filename: `${getBaseName(file.name)}-inverted.pdf`,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("invertPdf.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setError(null); };

  return (
    <ToolLayout title={t("tools.invertPdf.title")} description={t("invertPdf.pageDescription")} icon="invert_colors" iconClass="bg-purple-50 text-purple-600">
      {result ? (
        <ToolCard>
          <DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} />
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <FileDropzone onFiles={(f) => { setFile(f[0]); setError(null); }} files={file ? [file] : []} />
          </ToolCard>
          {file && (
            <>
              {processing && (
                <ToolCard>
                  <ProgressBar value={progress} label={t("invertPdf.progress", { value: progress })} />
                </ToolCard>
              )}
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleConvert} loading={processing}>
                <span className="material-symbols-outlined text-[18px]">invert_colors</span>
                {t("invertPdf.button")}
              </PrimaryButton>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
