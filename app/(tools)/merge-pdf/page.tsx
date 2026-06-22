"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { mergePDFs } from "@/lib/pdf/merge";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { useTranslation } from "@/lib/i18n";

export default function MergePDFPage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const addFiles = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setResult(null);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (from: number, to: number) => {
    setFiles((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  const handleMerge = async () => {
    if (files.length < (batchMode ? 1 : 2)) return;
    setProcessing(true);
    setError(null);
    try {
      if (batchMode) {
        const zip = new JSZip();
        for (let i = 0; i < files.length; i += 2) {
          const group = files.slice(i, i + 2);
          const buffers = await Promise.all(group.map((f) => f.arrayBuffer()));
          const bytes = group.length === 1
            ? new Uint8Array(buffers[0])
            : await mergePDFs(buffers);
          const label = group.length === 1
            ? getBaseName(group[0].name)
            : `${getBaseName(group[0].name)}-${getBaseName(group[1].name)}`;
          zip.file(`${label}-merged.pdf`, bytes);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setResult({ blob: zipBlob, filename: "merged-batch.zip" });
      } else {
        const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
        const bytes = await mergePDFs(buffers);
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        setResult({ blob, filename: "merged.pdf" });
      }
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("merge.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); setBatchMode(false); };

  return (
    <ToolLayout
      title={t("tools.mergePdf.title")}
      description={t("merge.pageDescription")}
      icon="merge"
      iconClass="bg-blue-50 text-blue-600"
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
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <input type="checkbox" checked={batchMode} onChange={(e) => { setBatchMode(e.target.checked); setResult(null); }} />
              {t("batch.mode")}
            </label>
            {batchMode && <p className="text-xs text-slate-500 mb-3">{t("merge.batchHint")}</p>}
            <FileDropzone
              onFiles={addFiles}
              files={[]}
              maxFiles={20}
              label={t("merge.dropHere")}
              sublabel={t("merge.clickToSelect")}
            />
          </ToolCard>

          {files.length > 0 && (
            <ToolCard>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("merge.fileCount", { count: files.length })}
                </p>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                  {t("common.clearAll")}
                </button>
              </div>

              <div className="space-y-1.5">
                {files.map((file, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => setDragFrom(i)}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragFrom !== null && dragFrom !== i) moveFile(dragFrom, i);
                      setDragFrom(null);
                      setDragOver(null);
                    }}
                    onDragEnd={() => { setDragFrom(null); setDragOver(null); }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded border text-sm transition-all cursor-grab active:cursor-grabbing",
                      dragOver === i
                        ? "border-teal-400 bg-teal-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[18px]">drag_indicator</span>
                    <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-[18px]">picture_as_pdf</span>
                    <span className="flex-1 truncate text-slate-700 dark:text-slate-300 font-medium">{file.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </ToolCard>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>
          )}

          <PrimaryButton
            onClick={handleMerge}
            loading={processing}
            disabled={batchMode ? files.length < 1 : files.length < 2}
          >
            <span className="material-symbols-outlined text-[18px]">merge</span>
            {batchMode
              ? t("merge.batchButton", { count: files.length })
              : files.length >= 2
                ? t("merge.mergeButton", { count: files.length })
                : t("merge.addAtLeast2")}
          </PrimaryButton>
        </div>
      )}
    </ToolLayout>
  );
}
