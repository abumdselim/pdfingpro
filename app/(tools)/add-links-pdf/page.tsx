"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { addLinksToPDF, parseLinkLines } from "@/lib/pdf/add-links";
import { getPdfPageCount } from "@/lib/pdf/core";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function AddLinksPdfPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [lines, setLines] = useState("1|https://pdfing.pro.bd|Pdfing Pro");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const pageCount = await getPdfPageCount(buffer);
      const entries = parseLinkLines(lines, pageCount);
      if (!entries?.length) {
        setError(t("addLinksPdf.invalidLines"));
        return;
      }
      const bytes = await addLinksToPDF(buffer, { entries });
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${getBaseName(file.name)}-links.pdf` });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("common.failed"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <ToolLayout
      title={t("tools.addLinksPdf.title")}
      description={t("addLinksPdf.pageDescription")}
      icon="link"
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
            <FileDropzone onFiles={(files) => setFile(files[0])} files={file ? [file] : []} />
          </ToolCard>

          {file && (
            <ToolCard>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                {t("addLinksPdf.entriesLabel")}
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t("addLinksPdf.entriesHint")}</p>
              <textarea value={lines} onChange={(e) => setLines(e.target.value)} rows={8} className="ds-input font-mono text-xs" />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded mt-3">
                  {error}
                </p>
              )}
              <div className="mt-4">
                <PrimaryButton onClick={handleApply} loading={processing}>
                  <span className="material-symbols-outlined text-[18px]">link</span>
                  {t("addLinksPdf.button")}
                </PrimaryButton>
              </div>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
