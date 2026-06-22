"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import { imagesToPDF } from "@/lib/pdf/convert";
import { downloadBlob, formatBytes, getBaseName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { useTranslation } from "@/lib/i18n";

const IMAGE_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/bmp": [".bmp"],
};

export default function JPGToPDFPage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted]); setResult(null); setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: IMAGE_ACCEPT, multiple: true });

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));
  const moveFile = (from: number, to: number) => {
    setFiles((prev) => { const arr = [...prev]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return arr; });
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true); setError(null);
    try {
      if (batchMode) {
        const zip = new JSZip();
        for (const f of files) {
          const bytes = await imagesToPDF([f]);
          zip.file(`${getBaseName(f.name)}.pdf`, bytes);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setResult({ blob: zipBlob, filename: "images-batch.zip" });
      } else {
        const bytes = await imagesToPDF(files);
        const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
        setResult({ blob, filename: files.length === 1 ? `${getBaseName(files[0].name)}.pdf` : "images.pdf" });
      }
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("jpgToPdf.error"));
    } finally { setProcessing(false); }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); };

  return (
    <ToolLayout title={t("tools.jpgToPdf.title")} description={t("jpgToPdf.pageDescription")} icon="add_photo_alternate" iconClass="bg-orange-50 text-orange-600">
      {result ? (
        <ToolCard>
          <DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} sizeBytes={result.blob.size} />
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <input type="checkbox" checked={batchMode} onChange={(e) => { setBatchMode(e.target.checked); setFiles([]); }} />
              {t("batch.mode")}
            </label>
            {batchMode && <p className="text-xs text-slate-500 mb-3">{t("batch.modeHint")}</p>}
            <div {...getRootProps()} className={cn(
              "flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg py-10 cursor-pointer transition-all",
              isDragActive ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:border-teal-400 hover:bg-slate-50"
            )}>
              <input {...getInputProps()} />
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[40px]">add_photo_alternate</span>
              <div className="text-center">
                <p className="font-medium text-slate-700 dark:text-slate-300">{t("jpgToPdf.dropHere")}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t("jpgToPdf.formats")}</p>
              </div>
            </div>
          </ToolCard>

          {files.length > 0 && (
            <ToolCard>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("jpgToPdf.imageCount", { count: files.length })}
                </p>
                <button onClick={() => setFiles([])} className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300 transition-colors">
                  {t("common.clearAll")}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-5">
                {files.map((f, i) => (
                  <div key={i} draggable onDragStart={(e) => e.dataTransfer.setData("index", String(i))}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); moveFile(Number(e.dataTransfer.getData("index")), i); }}
                    className="relative group rounded border border-slate-200 dark:border-slate-700 overflow-hidden cursor-grab">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(f)} alt={f.name} className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                    <button onClick={() => removeFile(i)} className="absolute top-1 right-1 w-5 h-5 bg-white dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded">{formatBytes(f.size)}</span>
                  </div>
                ))}
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded mb-4">{error}</p>}
              <PrimaryButton onClick={handleConvert} loading={processing}>
                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                {t("jpgToPdf.button")}
              </PrimaryButton>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
