"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { repairPDF } from "@/lib/pdf/repair";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function RepairPdfPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRepair = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const { bytes, message: msg } = await repairPDF(await file.arrayBuffer());
      setMessage(msg);
      setResult({ blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }), filename: `${getBaseName(file.name)}-repaired.pdf` });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("repair.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setError(null); setMessage(""); };

  return (
    <ToolLayout title={t("tools.repairPdf.title")} description={t("repair.pageDescription")} icon="build" iconClass="bg-orange-50 text-orange-600">
      {result ? (
        <ToolCard>
          <DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} />
          {message && <p className="text-center text-sm text-slate-500 mt-2">{message}</p>}
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <FileDropzone onFiles={(f) => { setFile(f[0]); setError(null); }} files={file ? [file] : []} />
          </ToolCard>
          {file && (
            <>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/50 rounded text-sm text-amber-700 dark:text-amber-300">
                {t("repair.note")}
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleRepair} loading={processing}>
                <span className="material-symbols-outlined text-[18px]">build</span>
                {t("repair.button")}
              </PrimaryButton>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
