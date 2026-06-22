"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess, ProgressBar } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import BatchFileQueue, { createBatchId, type BatchQueueItem } from "@/components/shared/BatchFileQueue";
import { compressPDF, type CompressionLevel } from "@/lib/pdf/compress";
import { downloadBlob, formatBytes, getBaseName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { useTranslation } from "@/lib/i18n";

export default function CompressPDFPage() {
  const { t } = useTranslation();

  const LEVELS: { id: CompressionLevel; labelKey: string; descKey: string }[] = [
    { id: "low", labelKey: "compress.low", descKey: "compress.lowDesc" },
    { id: "medium", labelKey: "compress.medium", descKey: "compress.mediumDesc" },
    { id: "high", labelKey: "compress.high", descKey: "compress.highDesc" },
  ];

  const [file, setFile] = useState<File | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [queue, setQueue] = useState<BatchQueueItem[]>([]);
  const [level, setLevel] = useState<CompressionLevel>("medium");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addToQueue = (files: File[]) => {
    setQueue((prev) => [...prev, ...files.map((f) => ({ id: createBatchId(), file: f, status: "pending" as const }))]);
    setResult(null);
    setError(null);
  };

  const handleCompress = async () => {
    if (batchMode) {
      if (queue.length === 0) return;
      setProcessing(true);
      setProgress(0);
      setError(null);
      try {
        const zip = new JSZip();
        for (let i = 0; i < queue.length; i++) {
          const item = queue[i];
          setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "processing" } : q)));
          const buffer = await item.file.arrayBuffer();
          const bytes = await compressPDF(buffer, level, (page, total) => {
            setProgress(Math.round(((i + page / total) / queue.length) * 100));
            setProgressLabel(t("compress.progress", { page, total }));
          });
          zip.file(`${getBaseName(item.file.name)}-compressed.pdf`, bytes);
          setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "done" } : q)));
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, "compressed-pdfs.zip");
        setResult({ blob: zipBlob, filename: "compressed-pdfs.zip" });
      } catch (err: unknown) {
        setError((err as Error)?.message ?? t("compress.error"));
      } finally {
        setProcessing(false);
      }
      return;
    }

    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = await compressPDF(buffer, level, (page, total) => {
        setProgress(Math.round((page / total) * 100));
        setProgressLabel(t("compress.progress", { page, total }));
      });
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${getBaseName(file.name)}-compressed.pdf` });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("compress.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setQueue([]);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <ToolLayout
      title={t("tools.compressPdf.title")}
      description={t("compress.pageDescription")}
      icon="compress"
      iconClass="bg-teal-50 text-teal-600"
    >
      {result ? (
        <ToolCard>
          <DownloadSuccess
            onDownload={() => downloadBlob(result.blob, result.filename)}
            onReset={reset}
            filename={result.filename}
            sizeBytes={result.blob.size}
          />
          {file && !batchMode && (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
              {t("compress.result", {
                from: formatBytes(file.size),
                to: formatBytes(result.blob.size),
                percent: Math.round((1 - result.blob.size / file.size) * 100),
              })}
            </p>
          )}
          {batchMode && (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">{t("batch.complete")}</p>
          )}
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <input type="checkbox" checked={batchMode} onChange={(e) => { setBatchMode(e.target.checked); setFile(null); setQueue([]); }} />
              {t("batch.mode")}
            </label>
            {batchMode ? (
              <>
                <p className="text-xs text-slate-500 mb-3">{t("batch.modeHint")}</p>
                <FileDropzone onFiles={addToQueue} files={[]} maxFiles={20} />
                <BatchFileQueue
                  items={queue}
                  onRemove={(id) => setQueue((prev) => prev.filter((q) => q.id !== id))}
                  onClear={() => setQueue([])}
                  className="mt-3"
                />
              </>
            ) : (
              <FileDropzone
                onFiles={(f) => { setFile(f[0]); setResult(null); setError(null); }}
                files={file ? [file] : []}
              />
            )}
          </ToolCard>

          {(file || queue.length > 0) && (
            <>
              <ToolCard>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t("compress.level")}</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {LEVELS.map(({ id, labelKey, descKey }) => (
                    <button
                      key={id}
                      onClick={() => setLevel(id)}
                      className={cn(
                        "border rounded-lg p-4 text-left transition-all",
                        level === id
                          ? "border-teal-500 bg-teal-50"
                          : "border-slate-200 hover:border-slate-400"
                      )}
                    >
                      <p className={cn("font-semibold text-sm", level === id ? "text-teal-700" : "text-slate-800")}>
                        {t(labelKey)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t(descKey)}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-5 p-3 bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/50 rounded text-xs text-amber-700 dark:text-amber-300">
                  <span className="font-semibold">{t("compress.noteLabel")}</span> {t("compress.note")}
                </div>
              </ToolCard>

              {processing && (
                <ToolCard>
                  <ProgressBar value={progress} label={progressLabel} />
                </ToolCard>
              )}

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>
              )}

              <PrimaryButton onClick={handleCompress} loading={processing} disabled={batchMode ? queue.length === 0 : !file}>
                <span className="material-symbols-outlined text-[18px]">compress</span>
                {t("compress.button")}
              </PrimaryButton>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}

