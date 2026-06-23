"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { convertToPdfA } from "@/lib/pdf/pdfa";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function PdfToPdfaPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const { bytes, warnings: w } = await convertToPdfA(await file.arrayBuffer());
      setWarnings(w);
      setResult({ blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }), filename: `${getBaseName(file.name)}-normalized.pdf` });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("pdfToPdfa.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setWarnings([]); setError(null); };

  return (
    <ToolLayout
      title={t("tools.pdfToPdfa.title")}
      description={t("pdfToPdfa.pageDescription")}
      icon="verified"
      iconClass="bg-slate-50 text-slate-600"
    >
      {result ? (
        <ToolCard className="space-y-4">
          <DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} />
          {warnings.length > 0 && (
            <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-disc pl-4">
              {warnings.map((w) => <li key={w}>{w}</li>)}
            </ul>
          )}
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/50 rounded text-sm text-amber-700 dark:text-amber-300">
            {t("pdfToPdfa.warning")}
          </div>
          <ToolCard>
            <FileDropzone onFiles={(f) => { setFile(f[0]); setError(null); }} files={file ? [file] : []} />
          </ToolCard>
          {file && (
            <>
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleConvert} loading={processing}>
                <span className="material-symbols-outlined text-[18px]">verified</span>
                {t("pdfToPdfa.button")}
              </PrimaryButton>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
