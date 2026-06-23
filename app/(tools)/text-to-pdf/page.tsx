"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import { textToPDF } from "@/lib/pdf/text-to-pdf";
import { downloadBlob } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function TextToPdfPage() {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!text.trim()) {
      setError(t("textToPdf.empty"));
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const bytes = await textToPDF({ text, title: title.trim() || undefined });
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: "text-document.pdf" });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("textToPdf.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setTitle("");
    setText("");
    setResult(null);
    setError(null);
  };

  return (
    <ToolLayout
      title={t("tools.textToPdf.title")}
      description={t("textToPdf.pageDescription")}
      icon="article"
      iconClass="bg-slate-50 text-slate-600"
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
        <ToolCard>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("textToPdf.titleLabel")}</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="ds-input mt-1"
                placeholder={t("textToPdf.titlePlaceholder")}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("textToPdf.textLabel")}</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={14}
                className="ds-input mt-1 font-mono text-sm"
                placeholder={t("textToPdf.textPlaceholder")}
              />
            </label>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">
                {error}
              </p>
            )}
            <PrimaryButton onClick={handleConvert} loading={processing}>
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              {t("textToPdf.button")}
            </PrimaryButton>
          </div>
        </ToolCard>
      )}
    </ToolLayout>
  );
}
