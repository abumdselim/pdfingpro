"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, ProgressBar } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { pdfToExcel } from "@/lib/pdf/pdf-to-excel";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function PdfToExcelPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const { csv } = await pdfToExcel(await file.arrayBuffer(), (page, total) => {
        setProgress(Math.round((page / total) * 100));
      });
      const blob = new Blob([csv], { type: "text/csv" });
      downloadBlob(blob, `${getBaseName(file.name)}-extracted.csv`);
      setDone(true);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("pdfToExcel.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setDone(false); setError(null); };

  return (
    <ToolLayout title={t("tools.pdfToExcel.title")} description={t("pdfToExcel.pageDescription")} icon="table_chart" iconClass="bg-green-50 text-green-600">
      <div className="space-y-4">
        <ToolCard>
          <FileDropzone onFiles={(f) => { setFile(f[0]); setDone(false); setError(null); }} files={file ? [file] : []} />
        </ToolCard>
        {file && !done && (
          <>
            <div className="p-3 bg-sky-50 dark:bg-sky-950/25 border border-sky-200 dark:border-sky-800/50 rounded text-xs text-sky-700 dark:text-sky-300">
              {t("pdfToExcel.note")}
            </div>
            {processing && <ToolCard><ProgressBar value={progress} /></ToolCard>}
            {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
            <PrimaryButton onClick={handleExtract} loading={processing}>
              <span className="material-symbols-outlined text-[18px]">table_chart</span>
              {t("pdfToExcel.button")}
            </PrimaryButton>
          </>
        )}
        {done && (
          <ToolCard>
            <p className="text-center text-slate-600 dark:text-slate-400">{t("common.done")}</p>
            <div className="flex justify-center mt-4">
              <PrimaryButton onClick={reset}>{t("common.startOver")}</PrimaryButton>
            </div>
          </ToolCard>
        )}
      </div>
    </ToolLayout>
  );
}
