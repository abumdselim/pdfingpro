"use client";

import { useState } from "react";
import type { Accept } from "react-dropzone";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { TOOLS } from "@/lib/tools";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import type { OfficeInputFormat } from "@/lib/pdf/office-to-pdf-server";

interface OfficeToPdfPageProps {
  toolId: string;
  format: OfficeInputFormat;
  accept: Accept;
  localeKey: string;
}

export default function OfficeToPdfPage({ toolId, format, accept, localeKey }: OfficeToPdfPageProps) {
  const { t } = useTranslation();
  const tool = TOOLS.find((x) => x.id === toolId);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  if (!tool) return null;

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("format", format);

      const response = await fetch("/api/office-to-pdf", { method: "POST", body });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t(`${localeKey}.error`));
      }

      const blob = await response.blob();
      const filename =
        response.headers.get("Content-Disposition")?.match(/filename="(.+?)"/)?.[1] ??
        `${getBaseName(file.name)}.pdf`;
      setResult({ blob, filename });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t(`${localeKey}.error`));
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
      title={t(tool.titleKey)}
      description={t(`${localeKey}.pageDescription`)}
      icon={tool.icon}
      iconClass={tool.color}
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
            {t(`${localeKey}.serverNotice`)}
          </div>
          <ToolCard>
            <FileDropzone
              onFiles={(files) => {
                setFile(files[0] ?? null);
                setError(null);
              }}
              files={file ? [file] : []}
              accept={accept}
            />
          </ToolCard>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>
          )}
          {file && (
            <PrimaryButton onClick={handleConvert} loading={processing} privacyBadge="server">
              {t(`${localeKey}.button`)}
            </PrimaryButton>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
