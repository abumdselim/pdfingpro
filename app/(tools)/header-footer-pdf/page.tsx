"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { addHeaderFooter } from "@/lib/pdf/header-footer";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function HeaderFooterPdfPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [headerLeft, setHeaderLeft] = useState("");
  const [headerCenter, setHeaderCenter] = useState("");
  const [headerRight, setHeaderRight] = useState("");
  const [footerLeft, setFooterLeft] = useState("");
  const [footerCenter, setFooterCenter] = useState("");
  const [footerRight, setFooterRight] = useState("");
  const [includePageNumber, setIncludePageNumber] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = await addHeaderFooter(buffer, {
        header: { left: headerLeft, center: headerCenter, right: headerRight },
        footer: { left: footerLeft, center: footerCenter, right: footerRight },
        includePageNumber,
        pageNumberFormat: "{n} / {total}",
      });
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${getBaseName(file.name)}-header-footer.pdf` });
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

  const field = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    placeholder: string
  ) => (
    <label className="block">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="ds-input mt-1"
      />
    </label>
  );

  return (
    <ToolLayout
      title={t("tools.headerFooterPdf.title")}
      description={t("headerFooterPdf.pageDescription")}
      icon="view_agenda"
      iconClass="bg-sky-50 text-sky-600"
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
            <FileDropzone
              onFiles={(files) => {
                setFile(files[0]);
                setResult(null);
                setError(null);
              }}
              files={file ? [file] : []}
            />
          </ToolCard>

          {file && (
            <ToolCard>
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    {t("headerFooterPdf.headerSection")}
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {field(t("headerFooterPdf.left"), headerLeft, setHeaderLeft, t("headerFooterPdf.headerPlaceholder"))}
                    {field(t("headerFooterPdf.center"), headerCenter, setHeaderCenter, t("headerFooterPdf.headerPlaceholder"))}
                    {field(t("headerFooterPdf.right"), headerRight, setHeaderRight, t("headerFooterPdf.headerPlaceholder"))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    {t("headerFooterPdf.footerSection")}
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {field(t("headerFooterPdf.left"), footerLeft, setFooterLeft, t("headerFooterPdf.footerPlaceholder"))}
                    {field(t("headerFooterPdf.center"), footerCenter, setFooterCenter, t("headerFooterPdf.footerPlaceholder"))}
                    {field(t("headerFooterPdf.right"), footerRight, setFooterRight, t("headerFooterPdf.footerPlaceholder"))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={includePageNumber}
                    onChange={(e) => setIncludePageNumber(e.target.checked)}
                  />
                  {t("headerFooterPdf.includePageNumbers")}
                </label>

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">
                    {error}
                  </p>
                )}

                <PrimaryButton onClick={handleApply} loading={processing}>
                  <span className="material-symbols-outlined text-[18px]">view_agenda</span>
                  {t("headerFooterPdf.button")}
                </PrimaryButton>
              </div>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
