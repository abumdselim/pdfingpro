"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, ProgressBar, SecondaryButton } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { pdfToHtml } from "@/lib/pdf/pdf-to-html";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function PdfToHtmlPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const html = await pdfToHtml(await file.arrayBuffer(), (page, total) => setProgress(Math.round((page / total) * 100)));
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      downloadBlob(blob, `${getBaseName(file.name)}.html`);
      setDone(true);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("pdfToHtml.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setDone(false); setError(null); };

  return (
    <ToolLayout title={t("tools.pdfToHtml.title")} description={t("pdfToHtml.pageDescription")} icon="code" iconClass="bg-orange-50 text-orange-600">
      <div className="space-y-4">
        <ToolCard><FileDropzone onFiles={(f) => { setFile(f[0]); setDone(false); }} files={file ? [file] : []} /></ToolCard>
        {file && !done && (
          <>
            {processing && <ToolCard><ProgressBar value={progress} /></ToolCard>}
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <PrimaryButton onClick={handleConvert} loading={processing}>{t("pdfToHtml.button")}</PrimaryButton>
          </>
        )}
        {done && (
          <ToolCard>
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="text-sm text-slate-600">{t("pdfToHtml.done")}</p>
              <SecondaryButton onClick={reset}>{t("common.startOver")}</SecondaryButton>
            </div>
          </ToolCard>
        )}
      </div>
    </ToolLayout>
  );
}
