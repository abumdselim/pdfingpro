"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import PDFThumbnails from "@/components/shared/PDFThumbnail";
import { duplicatePages } from "@/lib/pdf/duplicate-pages";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function DuplicatePagesPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const togglePage = (i: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleDuplicate = async () => {
    if (!file || selectedPages.size === 0) return;
    setProcessing(true);
    setError(null);
    try {
      const bytes = await duplicatePages(await file.arrayBuffer(), Array.from(selectedPages));
      setResult({
        blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
        filename: `${getBaseName(file.name)}-duplicated.pdf`,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("duplicatePages.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setSelectedPages(new Set()); setResult(null); setError(null); };

  return (
    <ToolLayout title={t("tools.duplicatePages.title")} description={t("duplicatePages.pageDescription")} icon="content_copy" iconClass="bg-indigo-50 text-indigo-600">
      {result ? (
        <ToolCard><DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} /></ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard><FileDropzone onFiles={(f) => { setFile(f[0]); setSelectedPages(new Set()); setError(null); }} files={file ? [file] : []} /></ToolCard>
          {file && (
            <>
              <ToolCard>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("duplicatePages.selectPages", { count: selectedPages.size })}</p>
                <p className="text-xs text-slate-500 mb-3">{t("duplicatePages.hint")}</p>
                <PDFThumbnails file={file} selectedPages={selectedPages} onTogglePage={togglePage} columns={4} />
              </ToolCard>
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleDuplicate} loading={processing} disabled={selectedPages.size === 0}>
                <span className="material-symbols-outlined text-[18px]">content_copy</span>{t("duplicatePages.button")}
              </PrimaryButton>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
