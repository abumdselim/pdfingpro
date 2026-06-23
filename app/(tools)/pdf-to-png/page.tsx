"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, ProgressBar } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { pdfToImages } from "@/lib/pdf/convert";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { useTranslation } from "@/lib/i18n";

export default function PdfToPngPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setError(null);
    try {
      const images = await pdfToImages(await file.arrayBuffer(), "png", scale, 1, (page, total) => {
        setProgress(Math.round((page / total) * 100));
      });
      const zip = new JSZip();
      const base = getBaseName(file.name);
      images.forEach(({ blob, filename }) => zip.file(filename, blob));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `${base}-png.zip`);
      setDone(true);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("pdfToPng.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setDone(false); setError(null); };

  return (
    <ToolLayout title={t("tools.pdfToPng.title")} description={t("pdfToPng.pageDescription")} icon="image" iconClass="bg-violet-50 text-violet-600">
      <div className="space-y-4">
        <ToolCard>
          <FileDropzone onFiles={(f) => { setFile(f[0]); setDone(false); }} files={file ? [file] : []} />
        </ToolCard>
        {file && !done && (
          <ToolCard>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("pdfToPng.resolution")}</p>
            <div className="flex gap-2">
              {[1, 1.5, 2, 3].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScale(s)}
                  className={cn(
                    "px-3 py-1.5 rounded border text-sm font-medium transition-all",
                    scale === s ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600 hover:border-slate-400"
                  )}
                >
                  {s}×
                </button>
              ))}
            </div>
            {processing && <div className="mt-4"><ProgressBar value={progress} label={t("pdfToPng.progress", { value: progress })} /></div>}
            {error && <p className="mt-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
            <PrimaryButton onClick={handleConvert} loading={processing} className="mt-5">
              <span className="material-symbols-outlined text-[18px]">download</span>
              {t("pdfToPng.button")}
            </PrimaryButton>
          </ToolCard>
        )}
        {done && (
          <ToolCard>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">{t("pdfToPng.done")}</p>
            <button type="button" onClick={reset} className="mt-3 text-sm text-teal-600 font-semibold hover:underline">{t("common.startOver")}</button>
          </ToolCard>
        )}
      </div>
    </ToolLayout>
  );
}
