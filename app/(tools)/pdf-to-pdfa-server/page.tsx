"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function PdfToPdfaServerPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/pdf-to-pdfa-server", { method: "POST", body });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t("pdfToPdfaServer.error"));
      }

      const blob = await response.blob();
      const filename =
        response.headers.get("Content-Disposition")?.match(/filename="(.+?)"/)?.[1] ??
        `${getBaseName(file.name)}-pdfa-2b.pdf`;
      setResult({ blob, filename });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("pdfToPdfaServer.error"));
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
      title={t("tools.pdfToPdfaServer.title")}
      description={t("pdfToPdfaServer.pageDescription")}
      icon="verified"
      iconClass="bg-blue-50 text-blue-700"
      processingTier="server"
    >
      {result ? (
        <ToolCard>
          <DownloadSuccess
            onDownload={() => downloadBlob(result.blob, result.filename)}
            onReset={reset}
            filename={result.filename}
            sizeBytes={result.blob.size}
          />
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200">
            {t("pdfToPdfaServer.serverNotice")}
          </div>
          <ToolCard>
            <FileDropzone
              onFiles={(files) => {
                setFile(files[0] ?? null);
                setError(null);
              }}
              files={file ? [file] : []}
            />
          </ToolCard>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>
          )}
          {file && (
            <PrimaryButton onClick={handleConvert} loading={processing} privacyBadge="server">
              {t("pdfToPdfaServer.button")}
            </PrimaryButton>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
