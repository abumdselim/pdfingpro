"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess, ProgressBar } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { removeAnnotations } from "@/lib/pdf/remove-annotations";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function RemoveAnnotationsPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setError(null);
    try {
      const bytes = await removeAnnotations(await file.arrayBuffer(), 2, 0.92, (page, total) => {
        setProgress(Math.round((page / total) * 100));
      });
      setResult({
        blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
        filename: `${getBaseName(file.name)}-clean.pdf`,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("removeAnnotations.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setError(null); };

  return (
    <ToolLayout title={t("tools.removeAnnotations.title")} description={t("removeAnnotations.pageDescription")} icon="comments_disabled" iconClass="bg-rose-50 text-rose-600">
      {result ? (
        <ToolCard><DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} /></ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard><FileDropzone onFiles={(f) => { setFile(f[0]); setError(null); }} files={file ? [file] : []} /></ToolCard>
          {file && (
            <>
              <ToolCard><p className="text-sm text-slate-600 dark:text-slate-400">{t("removeAnnotations.hint")}</p></ToolCard>
              {processing && <ToolCard><ProgressBar value={progress} label={t("removeAnnotations.progress", { value: progress })} /></ToolCard>}
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleRemove} loading={processing}><span className="material-symbols-outlined text-[18px]">comments_disabled</span>{t("removeAnnotations.button")}</PrimaryButton>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
