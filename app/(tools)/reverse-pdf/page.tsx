"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { reversePdfPages } from "@/lib/pdf/reverse";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function ReversePdfPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReverse = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const bytes = await reversePdfPages(await file.arrayBuffer());
      setResult({
        blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
        filename: `${getBaseName(file.name)}-reversed.pdf`,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("reversePdf.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setError(null); };

  return (
    <ToolLayout title={t("tools.reversePdf.title")} description={t("reversePdf.pageDescription")} icon="swap_vert" iconClass="bg-amber-50 text-amber-600">
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
              <ToolCard>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t("reversePdf.hint")}</p>
              </ToolCard>
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleReverse} loading={processing}>
                <span className="material-symbols-outlined text-[18px]">swap_vert</span>
                {t("reversePdf.button")}
              </PrimaryButton>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
