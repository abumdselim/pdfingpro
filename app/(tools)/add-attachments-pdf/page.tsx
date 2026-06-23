"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { addAttachmentsToPdf } from "@/lib/pdf/attachments";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function AddAttachmentsPdfPage() {
  const { t } = useTranslation();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAttach = async () => {
    if (!pdfFile || attachments.length === 0) return;
    setProcessing(true);
    setError(null);
    try {
      const inputs = await Promise.all(
        attachments.map(async (file) => ({
          filename: file.name,
          bytes: new Uint8Array(await file.arrayBuffer()),
          mimeType: file.type || "application/octet-stream",
        }))
      );
      const bytes = await addAttachmentsToPdf(await pdfFile.arrayBuffer(), inputs);
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${getBaseName(pdfFile.name)}-with-attachments.pdf` });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("addAttachments.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setPdfFile(null);
    setAttachments([]);
    setResult(null);
    setError(null);
  };

  return (
    <ToolLayout
      title={t("tools.addAttachmentsPdf.title")}
      description={t("addAttachments.pageDescription")}
      icon="attachment"
      iconClass="bg-teal-50 text-teal-600"
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
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("addAttachments.pdfLabel")}</p>
            <FileDropzone onFiles={(f) => setPdfFile(f[0])} files={pdfFile ? [pdfFile] : []} />
          </ToolCard>

          {pdfFile && (
            <ToolCard>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("addAttachments.filesLabel")}</p>
              <FileDropzone
                onFiles={(f) => setAttachments((prev) => [...prev, ...f])}
                files={attachments}
                maxFiles={20}
                accept={{ "*/*": [] }}
                label={t("addAttachments.dropLabel")}
                sublabel={t("addAttachments.dropHint")}
              />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded mt-3">
                  {error}
                </p>
              )}
              <div className="mt-4">
                <PrimaryButton onClick={handleAttach} loading={processing} disabled={attachments.length === 0}>
                  <span className="material-symbols-outlined text-[18px]">attachment</span>
                  {t("addAttachments.button")}
                </PrimaryButton>
              </div>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
