"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { splitPdfByText } from "@/lib/pdf/split-by-text";
import { downloadBlob, getBaseName } from "@/lib/utils";
import JSZip from "jszip";
import { useTranslation } from "@/lib/i18n";

export default function SplitByTextPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [searchText, setSearchText] = useState("Chapter");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [done, setDone] = useState(false);
  const [partCount, setPartCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSplit = async () => {
    if (!file || !searchText.trim()) {
      setError(t("splitByText.empty"));
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const parts = await splitPdfByText(await file.arrayBuffer(), {
        searchText,
        caseSensitive,
        onProgress: (page, total) => setProgress(t("splitByText.progress", { page, total })),
      });
      const zip = new JSZip();
      const base = getBaseName(file.name);
      parts.forEach(({ bytes, label }) => zip.file(`${base}-${label}.pdf`, bytes));
      downloadBlob(await zip.generateAsync({ type: "blob" }), `${base}-by-text.zip`);
      setPartCount(parts.length);
      setDone(true);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("splitByText.error"));
    } finally {
      setProcessing(false);
      setProgress("");
    }
  };

  const reset = () => { setFile(null); setDone(false); setPartCount(0); setError(null); };

  return (
    <ToolLayout title={t("tools.splitByText.title")} description={t("splitByText.pageDescription")} icon="text_fields" iconClass="bg-indigo-50 text-indigo-600">
      {!file ? (
        <ToolCard><FileDropzone onFiles={(f) => setFile(f[0])} /></ToolCard>
      ) : done ? (
        <ToolCard>
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-sm text-slate-600">{t("splitByText.done", { count: partCount })}</p>
            <PrimaryButton onClick={reset}>{t("common.startOver")}</PrimaryButton>
          </div>
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <label className="block text-sm font-semibold mb-2">{t("splitByText.searchLabel")}</label>
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} className="ds-input" placeholder={t("splitByText.placeholder")} />
            <p className="text-xs text-slate-500 mt-2">{t("splitByText.hint")}</p>
            <label className="flex items-center gap-2 text-sm mt-3">
              <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
              {t("splitByText.caseSensitive")}
            </label>
          </ToolCard>
          <ToolCard>
            {progress && <p className="text-sm text-slate-500 mb-3">{progress}</p>}
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mb-3">{error}</p>}
            <PrimaryButton onClick={handleSplit} loading={processing}>{t("splitByText.button")}</PrimaryButton>
          </ToolCard>
        </div>
      )}
    </ToolLayout>
  );
}
