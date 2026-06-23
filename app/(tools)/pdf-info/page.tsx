"use client";

import { useState } from "react";
import ToolLayout, { ToolCard } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { getPdfInfo, type PdfInfo } from "@/lib/pdf/info";
import { formatBytes } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function PdfInfoPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<PdfInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFile = async (f: File) => {
    setFile(f);
    setLoading(true);
    setError(null);
    try {
      const data = await getPdfInfo(await f.arrayBuffer(), f.size);
      setInfo(data);
    } catch (err: unknown) {
      setInfo(null);
      setError((err as Error)?.message ?? t("pdfInfo.error"));
    } finally {
      setLoading(false);
    }
  };

  const rows: { label: string; value: string }[] = info
    ? [
        { label: t("pdfInfo.fileName"), value: file?.name ?? "" },
        { label: t("pdfInfo.fileSize"), value: formatBytes(info.fileSizeBytes) },
        { label: t("pdfInfo.pageCount"), value: String(info.pageCount) },
        { label: t("pdfInfo.encrypted"), value: info.encrypted ? t("pdfInfo.yes") : t("pdfInfo.no") },
        { label: t("metadata.title"), value: info.title || "—" },
        { label: t("metadata.author"), value: info.author || "—" },
        { label: t("metadata.subject"), value: info.subject || "—" },
        { label: t("metadata.keywords"), value: info.keywords || "—" },
        { label: t("metadata.creator"), value: info.creator || "—" },
        { label: t("metadata.producer"), value: info.producer || "—" },
        { label: t("pdfInfo.created"), value: info.creationDate || "—" },
        { label: t("pdfInfo.modified"), value: info.modificationDate || "—" },
      ]
    : [];

  return (
    <ToolLayout title={t("tools.pdfInfo.title")} description={t("pdfInfo.pageDescription")} icon="info" iconClass="bg-blue-50 text-blue-600">
      <div className="space-y-4">
        <ToolCard>
          <FileDropzone
            onFiles={(f) => loadFile(f[0])}
            files={file ? [file] : []}
          />
        </ToolCard>
        {loading && (
          <ToolCard>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-teal-500 text-[18px]">progress_activity</span>
              {t("pdfInfo.loading")}
            </p>
          </ToolCard>
        )}
        {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
        {info && !loading && (
          <ToolCard>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">{t("pdfInfo.details")}</p>
            <dl className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map(({ label, value }) => (
                <div key={label} className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-3 first:pt-0 last:pb-0">
                  <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</dt>
                  <dd className="sm:col-span-2 text-sm text-slate-800 dark:text-slate-200 break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </ToolCard>
        )}
      </div>
    </ToolLayout>
  );
}
