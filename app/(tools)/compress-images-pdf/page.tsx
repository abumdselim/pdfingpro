"use client";



import { useState } from "react";

import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess, ProgressBar } from "@/components/shared/ToolLayout";

import FileDropzone from "@/components/shared/FileDropzone";

import { compressPdfImages, type ImageCompressionLevel } from "@/lib/pdf/compress-images";

import { downloadBlob, getBaseName, cn } from "@/lib/utils";

import { useTranslation } from "@/lib/i18n";



const LEVELS: ImageCompressionLevel[] = ["low", "medium", "high"];



export default function CompressImagesPdfPage() {

  const { t } = useTranslation();

  const [file, setFile] = useState<File | null>(null);

  const [level, setLevel] = useState<ImageCompressionLevel>("medium");

  const [processing, setProcessing] = useState(false);

  const [progress, setProgress] = useState(0);

  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const [error, setError] = useState<string | null>(null);



  const handleProcess = async () => {

    if (!file) return;

    setProcessing(true);

    setProgress(0);

    setError(null);

    try {

      const bytes = await compressPdfImages(await file.arrayBuffer(), level, (page, total) => {

        setProgress(Math.round((page / total) * 100));

      });

      setResult({

        blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),

        filename: `${getBaseName(file.name)}-images-compressed.pdf`,

      });

    } catch (err: unknown) {

      setError((err as Error)?.message ?? t("compressImagesPdf.error"));

    } finally {

      setProcessing(false);

    }

  };



  const reset = () => { setFile(null); setResult(null); setError(null); };



  return (

    <ToolLayout title={t("tools.compressImagesPdf.title")} description={t("compressImagesPdf.pageDescription")} icon="photo_size_select_small" iconClass="bg-emerald-50 text-emerald-600">

      {result ? (

        <ToolCard><DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} /></ToolCard>

      ) : (

        <div className="space-y-4">

          <ToolCard><FileDropzone onFiles={(f) => { setFile(f[0]); setError(null); }} files={file ? [file] : []} /></ToolCard>

          {file && (

            <>

              <ToolCard className="space-y-4">

                <p className="text-sm text-slate-600 dark:text-slate-400">{t("compressImagesPdf.hint")}</p>

                <div>

                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("compressImagesPdf.quality")}</p>

                  <div className="flex flex-wrap gap-2">

                    {LEVELS.map((l) => (

                      <button key={l} type="button" onClick={() => setLevel(l)} className={cn(

                        "px-4 py-1.5 rounded-full text-sm font-medium border transition-all capitalize",

                        level === l ? "bg-teal-600 text-white border-teal-600" : "border-slate-200 text-slate-600"

                      )}>{t(`compressImagesPdf.level.${l}`)}</button>

                    ))}

                  </div>

                </div>

              </ToolCard>

              {processing && <ToolCard><ProgressBar value={progress} label={t("compressImagesPdf.progress", { value: progress })} /></ToolCard>}

              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}

              <PrimaryButton onClick={handleProcess} loading={processing}>

                <span className="material-symbols-outlined text-[18px]">photo_size_select_small</span>{t("compressImagesPdf.button")}

              </PrimaryButton>

            </>

          )}

        </div>

      )}

    </ToolLayout>

  );

}

