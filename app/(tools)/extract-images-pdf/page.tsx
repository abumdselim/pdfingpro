"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, ProgressBar, SecondaryButton } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { extractImagesFromPdf } from "@/lib/pdf/extract-images";
import { downloadBlob, getBaseName } from "@/lib/utils";
import JSZip from "jszip";
import { useTranslation } from "@/lib/i18n";

export default function ExtractImagesPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const images = await extractImagesFromPdf(await file.arrayBuffer(), (page, total) => {
        setProgress(Math.round((page / total) * 100));
      });
      if (images.length === 0) {
        setError(t("extractImages.none"));
        return;
      }
      const zip = new JSZip();
      images.forEach((img) => zip.file(img.filename, img.blob));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `${getBaseName(file.name)}-images.zip`);
      setCount(images.length);
      setDone(true);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("extractImages.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setDone(false); setCount(0); setError(null); };

  return (
    <ToolLayout title={t("tools.extractImagesPdf.title")} description={t("extractImages.pageDescription")} icon="photo_library" iconClass="bg-amber-50 text-amber-600">
      <div className="space-y-4">
        <ToolCard>
          <FileDropzone onFiles={(f) => { setFile(f[0]); setDone(false); setError(null); }} files={file ? [file] : []} />
        </ToolCard>
        {file && !done && (
          <>
            {processing && <ToolCard><ProgressBar value={progress} /></ToolCard>}
            {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
            <PrimaryButton onClick={handleExtract} loading={processing}>
              <span className="material-symbols-outlined text-[18px]">photo_library</span>
              {t("extractImages.button")}
            </PrimaryButton>
          </>
        )}
        {done && (
          <ToolCard>
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{t("extractImages.found", { count })}</p>
              <SecondaryButton onClick={reset}>{t("common.startOver")}</SecondaryButton>
            </div>
          </ToolCard>
        )}
      </div>
    </ToolLayout>
  );
}
