"use client";



import { useState } from "react";

import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";

import FileDropzone from "@/components/shared/FileDropzone";

import { nUpPdf, type NUpCount } from "@/lib/pdf/n-up";

import { type PageSizePreset } from "@/lib/pdf/resize";

import { downloadBlob, getBaseName, cn } from "@/lib/utils";

import { useTranslation } from "@/lib/i18n";



const COUNTS: NUpCount[] = [2, 4, 9];

const PRESETS: PageSizePreset[] = ["a4", "letter", "legal"];



export default function NUpPdfPage() {

  const { t } = useTranslation();

  const [file, setFile] = useState<File | null>(null);

  const [count, setCount] = useState<NUpCount>(4);

  const [preset, setPreset] = useState<PageSizePreset>("a4");

  const [processing, setProcessing] = useState(false);

  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const [error, setError] = useState<string | null>(null);



  const handleProcess = async () => {

    if (!file) return;

    setProcessing(true);

    setError(null);

    try {

      const bytes = await nUpPdf(await file.arrayBuffer(), count, preset);

      setResult({

        blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),

        filename: `${getBaseName(file.name)}-${count}up.pdf`,

      });

    } catch (err: unknown) {

      setError((err as Error)?.message ?? t("nUpPdf.error"));

    } finally {

      setProcessing(false);

    }

  };



  const reset = () => { setFile(null); setResult(null); setError(null); };



  return (

    <ToolLayout title={t("tools.nUpPdf.title")} description={t("nUpPdf.pageDescription")} icon="grid_view" iconClass="bg-violet-50 text-violet-600">

      {result ? (

        <ToolCard><DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} /></ToolCard>

      ) : (

        <div className="space-y-4">

          <ToolCard><FileDropzone onFiles={(f) => { setFile(f[0]); setError(null); }} files={file ? [file] : []} /></ToolCard>

          {file && (

            <>

              <ToolCard className="space-y-4">

                <div>

                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("nUpPdf.layout")}</p>

                  <div className="flex flex-wrap gap-2">

                    {COUNTS.map((c) => (

                      <button key={c} type="button" onClick={() => setCount(c)} className={cn(

                        "px-4 py-1.5 rounded border text-sm font-medium transition-all",

                        count === c ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600"

                      )}>{t(`nUpPdf.count.${c}`)}</button>

                    ))}

                  </div>

                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("nUpPdf.paperSize")}</p>

                  <div className="flex flex-wrap gap-2">

                    {PRESETS.map((p) => (

                      <button key={p} type="button" onClick={() => setPreset(p)} className={cn(

                        "px-4 py-1.5 rounded border text-sm font-medium uppercase transition-all",

                        preset === p ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600"

                      )}>{p}</button>

                    ))}

                  </div>

                </div>

              </ToolCard>

              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}

              <PrimaryButton onClick={handleProcess} loading={processing}>

                <span className="material-symbols-outlined text-[18px]">grid_view</span>{t("nUpPdf.button")}

              </PrimaryButton>

            </>

          )}

        </div>

      )}

    </ToolLayout>

  );

}

