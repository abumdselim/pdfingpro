"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess, ProgressBar } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { extractTextFromPdf } from "@/lib/pdf/extract-text";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function ExtractTextPdfPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setError(null);
    setPreview("");
    try {
      const text = await extractTextFromPdf(await file.arrayBuffer(), (page, total) => {
        setProgress(Math.round((page / total) * 100));
      });
      setPreview(text.slice(0, 4000) + (text.length > 4000 ? "\n…" : ""));
      setResult({
        blob: new Blob([text], { type: "text/plain;charset=utf-8" }),
        filename: `${getBaseName(file.name)}.txt`,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("extractText.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setPreview("");
    setError(null);
  };

  return (
    <ToolLayout
      title={t("tools.extractTextPdf.title")}
      description={t("extractText.pageDescription")}
      icon="text_snippet"
      iconClass="bg-slate-50 text-slate-600"
    >
      {result ? (
        <ToolCard>
          <DownloadSuccess
            onDownload={() => downloadBlob(result.blob, result.filename)}
            onReset={reset}
            filename={result.filename}
          />
          {preview && (
            <pre className="mt-4 max-h-64 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {preview}
            </pre>
          )}
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <FileDropzone onFiles={(f) => { setFile(f[0]); setError(null); }} files={file ? [file] : []} />
          </ToolCard>
          {file && (
            <>
              {processing && (
                <ToolCard>
                  <ProgressBar value={progress} label={t("extractText.progress", { value: progress })} />
                </ToolCard>
              )}
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>
              )}
              <PrimaryButton onClick={handleExtract} loading={processing}>
                <span className="material-symbols-outlined text-[18px]">text_snippet</span>
                {t("extractText.button")}
              </PrimaryButton>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
