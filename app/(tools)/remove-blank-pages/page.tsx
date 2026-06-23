"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess, ProgressBar } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { removeBlankPages } from "@/lib/pdf/blank-pages";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function RemoveBlankPagesPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [removedCount, setRemovedCount] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setError(null);
    try {
      const { bytes, removed } = await removeBlankPages(await file.arrayBuffer(), {}, (page, total) => {
        setProgress(Math.round((page / total) * 100));
      });
      setRemovedCount(removed);
      setResult({
        blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
        filename: `${getBaseName(file.name)}-no-blanks.pdf`,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("removeBlankPages.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setRemovedCount(0); setError(null); };

  return (
    <ToolLayout title={t("tools.removeBlankPages.title")} description={t("removeBlankPages.pageDescription")} icon="filter_none" iconClass="bg-sky-50 text-sky-600">
      {result ? (
        <ToolCard>
          <DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} />
          {removedCount > 0 && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{t("removeBlankPages.removed", { count: removedCount })}</p>}
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard><FileDropzone onFiles={(f) => { setFile(f[0]); setError(null); }} files={file ? [file] : []} /></ToolCard>
          {file && (
            <>
              <ToolCard><p className="text-sm text-slate-600 dark:text-slate-400">{t("removeBlankPages.hint")}</p></ToolCard>
              {processing && <ToolCard><ProgressBar value={progress} label={t("removeBlankPages.progress", { value: progress })} /></ToolCard>}
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleRemove} loading={processing}><span className="material-symbols-outlined text-[18px]">filter_none</span>{t("removeBlankPages.button")}</PrimaryButton>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
