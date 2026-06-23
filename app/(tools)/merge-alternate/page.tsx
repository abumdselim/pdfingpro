"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { mergeAlternatePages } from "@/lib/pdf/merge-alternate";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function MergeAlternatePage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMerge = async () => {
    if (files.length !== 2) return;
    setProcessing(true);
    setError(null);
    setProgress("");
    try {
      const [a, b] = await Promise.all(files.map((file) => file.arrayBuffer()));
      const bytes = await mergeAlternatePages(a, b, (page, total) =>
        setProgress(t("mergeAlternate.progress", { page, total }))
      );
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResult({
        blob,
        filename: `${getBaseName(files[0].name)}-${getBaseName(files[1].name)}-alternate.pdf`,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("merge.error"));
    } finally {
      setProcessing(false);
      setProgress("");
    }
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  return (
    <ToolLayout
      title={t("tools.mergeAlternate.title")}
      description={t("mergeAlternate.pageDescription")}
      icon="layers"
      iconClass="bg-indigo-50 text-indigo-600"
    >
      {result ? (
        <ToolCard>
          <DownloadSuccess
            onDownload={() => downloadBlob(result.blob, result.filename)}
            onReset={reset}
            filename={result.filename}
          />
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <FileDropzone
              onFiles={(incoming) => setFiles(incoming.slice(0, 2))}
              files={files}
              maxFiles={2}
              label={t("mergeAlternate.dropLabel")}
              sublabel={t("mergeAlternate.dropHint")}
            />
          </ToolCard>

          {files.length === 2 && (
            <ToolCard>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{t("mergeAlternate.orderHint")}</p>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded mb-3">
                  {error}
                </p>
              )}
              {progress && <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{progress}</p>}
              <PrimaryButton onClick={handleMerge} loading={processing}>
                <span className="material-symbols-outlined text-[18px]">layers</span>
                {t("mergeAlternate.button")}
              </PrimaryButton>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
