"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { autoRotatePDF, type AutoRotateMode } from "@/lib/pdf/auto-rotate";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function AutoRotatePdfPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<AutoRotateMode>("portrait");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRotate = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = await autoRotatePDF(buffer, mode);
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${getBaseName(file.name)}-auto-rotated.pdf` });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("autoRotatePdf.error"));
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
      title={t("tools.autoRotatePdf.title")}
      description={t("autoRotatePdf.pageDescription")}
      icon="screen_rotation"
      iconClass="bg-purple-50 text-purple-600"
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
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                {t("autoRotatePdf.modeLabel")}
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                {(["portrait", "landscape"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMode(value)}
                    className={cn(
                      "rounded-lg border px-4 py-3 text-sm font-medium text-left transition-colors",
                      mode === value
                        ? "border-[#1461bd] bg-[#1461bd]/10 text-[#1461bd] dark:border-teal-500 dark:bg-teal-500/10 dark:text-teal-300"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    )}
                  >
                    {t(value === "portrait" ? "autoRotatePdf.portrait" : "autoRotatePdf.landscape")}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t("autoRotatePdf.hint")}</p>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded mb-3">
                  {error}
                </p>
              )}
              <PrimaryButton onClick={handleRotate} loading={processing}>
                <span className="material-symbols-outlined text-[18px]">screen_rotation</span>
                {t("autoRotatePdf.button")}
              </PrimaryButton>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
