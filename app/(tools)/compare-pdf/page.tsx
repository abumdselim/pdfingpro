"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, ProgressBar } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { comparePDFs, type ComparePageResult } from "@/lib/pdf/compare";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function ComparePdfPage() {
  const { t } = useTranslation();
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pages, setPages] = useState<ComparePageResult[]>([]);
  const [summary, setSummary] = useState<{ left: number; right: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!leftFile || !rightFile) return;
    setProcessing(true);
    setError(null);
    setPages([]);
    try {
      const result = await comparePDFs(
        await leftFile.arrayBuffer(),
        await rightFile.arrayBuffer(),
        0.8,
        (page, total) => setProgress(Math.round((page / total) * 100))
      );
      setPages(result.pages);
      setSummary({ left: result.leftPageCount, right: result.rightPageCount });
      setCurrentPage(0);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("compare.error"));
    } finally {
      setProcessing(false);
    }
  };

  const page = pages[currentPage];

  return (
    <ToolLayout title={t("tools.comparePdf.title")} description={t("compare.pageDescription")} icon="compare" iconClass="bg-indigo-50 text-indigo-600">
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <ToolCard>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("compare.left")}</p>
            <FileDropzone onFiles={(f) => { setLeftFile(f[0]); setPages([]); }} files={leftFile ? [leftFile] : []} maxFiles={1} />
          </ToolCard>
          <ToolCard>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("compare.right")}</p>
            <FileDropzone onFiles={(f) => { setRightFile(f[0]); setPages([]); }} files={rightFile ? [rightFile] : []} maxFiles={1} />
          </ToolCard>
        </div>

        {leftFile && rightFile && pages.length === 0 && (
          <>
            {processing && <ToolCard><ProgressBar value={progress} /></ToolCard>}
            {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
            <PrimaryButton onClick={handleCompare} loading={processing}>
              <span className="material-symbols-outlined text-[18px]">compare</span>
              {t("compare.run")}
            </PrimaryButton>
          </>
        )}

        {pages.length > 0 && summary && page && (
          <ToolCard className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>{t("compare.pageDiff", { page: currentPage + 1, total: pages.length })}</span>
              <span>{t("compare.leftPages", { count: summary.left })} · {t("compare.rightPages", { count: summary.right })}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className={cn("border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900/50 min-h-[200px] flex items-center justify-center")}>
                {page.leftDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- canvas data URLs from pdf.js
                  <img src={page.leftDataUrl} alt={`Left page ${page.pageNumber}`} className="max-w-full h-auto" />
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </div>
              <div className={cn("border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900/50 min-h-[200px] flex items-center justify-center")}>
                {page.rightDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- canvas data URLs from pdf.js
                  <img src={page.rightDataUrl} alt={`Right page ${page.pageNumber}`} className="max-w-full h-auto" />
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <button type="button" disabled={currentPage === 0} onClick={() => setCurrentPage((p) => p - 1)} className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40">←</button>
              <button type="button" disabled={currentPage >= pages.length - 1} onClick={() => setCurrentPage((p) => p + 1)} className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40">→</button>
            </div>
          </ToolCard>
        )}
      </div>
    </ToolLayout>
  );
}
