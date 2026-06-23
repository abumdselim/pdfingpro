"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess, ProgressBar } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { flattenPdf } from "@/lib/pdf/flatten";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function FlattenPdfPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFlatten = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setError(null);
    try {
      const bytes = await flattenPdf(await file.arrayBuffer(), (page, total) => {
        setProgress(Math.round((page / total) * 100));
      });
      setResult({
        blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
        filename: `${getBaseName(file.name)}-flattened.pdf`,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("flattenPdf.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setError(null); };

  return (
    <ToolLayout title={t("tools.flattenPdf.title")} description={t("flattenPdf.pageDescription")} icon="layers" iconClass="bg-teal-50 text-teal-600">
      {result ? (
        <ToolCard><DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} /></ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard><FileDropzone onFiles={(f) => { setFile(f[0]); setError(null); }} files={file ? [file] : []} /></ToolCard>
          {file && (
            <>
              <ToolCard><p className="text-sm text-slate-600 dark:text-slate-400">{t("flattenPdf.hint")}</p></ToolCard>
              {processing && <ToolCard><ProgressBar value={progress} label={t("flattenPdf.progress", { value: progress })} /></ToolCard>}
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleFlatten} loading={processing}><span className="material-symbols-outlined text-[18px]">layers</span>{t("flattenPdf.button")}</PrimaryButton>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
