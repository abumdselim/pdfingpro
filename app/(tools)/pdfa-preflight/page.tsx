"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { runPdfaPreflight, type PdfaPreflightReport } from "@/lib/pdf/pdfa-preflight";
import { downloadBlob } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const STATUS_STYLE = {
  pass: "text-emerald-700 bg-emerald-50 border-emerald-200",
  warn: "text-amber-700 bg-amber-50 border-amber-200",
  fail: "text-red-700 bg-red-50 border-red-200",
} as const;

export default function PdfaPreflightPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [report, setReport] = useState<PdfaPreflightReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      setReport(await runPdfaPreflight(await file.arrayBuffer()));
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("pdfaPreflight.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setReport(null);
    setError(null);
  };

  const exportReport = () => {
    if (!report) return;
    downloadBlob(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
      "pdfa-preflight-report.json"
    );
  };

  return (
    <ToolLayout
      title={t("tools.pdfaPreflight.title")}
      description={t("pdfaPreflight.pageDescription")}
      icon="fact_check"
      iconClass="bg-slate-50 text-slate-700"
      processingTier="limited"
    >
      {report ? (
        <ToolCard className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${STATUS_STYLE[report.overall]}`}
            >
              {t(`pdfaPreflight.status.${report.overall}`)} · {report.score}%
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {t("pdfaPreflight.summary", {
                pages: String(report.pageCount),
                encrypted: report.encrypted ? t("common.yes") : t("common.no"),
              })}
            </span>
          </div>
          <ul className="space-y-2">
            {report.checks.map((check) => (
              <li
                key={check.id}
                className={`rounded-lg border px-3 py-2 text-sm ${STATUS_STYLE[check.status]}`}
              >
                <p className="font-semibold">{check.label}</p>
                <p className="mt-1 text-xs opacity-90">{check.detail}</p>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={exportReport}>{t("pdfaPreflight.export")}</PrimaryButton>
            <button
              type="button"
              onClick={reset}
              className="text-sm font-semibold text-[#1461bd] hover:underline"
            >
              {t("common.startOver")}
            </button>
          </div>
        </ToolCard>
      ) : (
        <div className="space-y-4">
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
            <PrimaryButton onClick={handleRun} loading={processing}>
              {t("pdfaPreflight.button")}
            </PrimaryButton>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
