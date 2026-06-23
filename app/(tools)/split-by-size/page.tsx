"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { parseSizeLimit, splitPDFBySize } from "@/lib/pdf/split-by-size";
import { downloadBlob, getBaseName } from "@/lib/utils";
import JSZip from "jszip";
import { useTranslation } from "@/lib/i18n";

export default function SplitBySizePage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [sizeValue, setSizeValue] = useState("5");
  const [unit, setUnit] = useState<"KB" | "MB">("MB");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSplit = async () => {
    if (!file) return;
    const maxBytes = parseSizeLimit(sizeValue, unit);
    if (!maxBytes) {
      setError(t("splitBySize.invalidSize"));
      return;
    }

    setProcessing(true);
    setError(null);
    setProgress("");
    try {
      const buffer = await file.arrayBuffer();
      const parts = await splitPDFBySize(buffer, {
        maxBytes,
        onProgress: (page, total) => setProgress(t("splitBySize.progress", { page, total })),
      });

      const zip = new JSZip();
      const base = getBaseName(file.name);
      parts.forEach(({ bytes, label }) => zip.file(`${base}-${label}.pdf`, bytes));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `${base}-by-size.zip`);
      setDone(true);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("split.error"));
    } finally {
      setProcessing(false);
      setProgress("");
    }
  };

  const reset = () => {
    setFile(null);
    setDone(false);
    setError(null);
  };

  return (
    <ToolLayout
      title={t("tools.splitBySize.title")}
      description={t("splitBySize.pageDescription")}
      icon="storage"
      iconClass="bg-rose-50 text-rose-600"
    >
      {!file ? (
        <ToolCard>
          <FileDropzone onFiles={(files) => setFile(files[0])} />
        </ToolCard>
      ) : done ? (
        <ToolCard>
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 icon-filled text-[36px]">
              check_circle
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("splitBySize.done")}</p>
            <PrimaryButton onClick={reset}>
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              {t("common.startOver")}
            </PrimaryButton>
          </div>
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t("splitBySize.maxSize")}
            </p>
            <div className="flex gap-2">
              <input
                value={sizeValue}
                onChange={(e) => setSizeValue(e.target.value)}
                type="number"
                min={1}
                className="ds-input max-w-[8rem]"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as "KB" | "MB")}
                className="ds-input max-w-[6rem]"
              >
                <option value="KB">KB</option>
                <option value="MB">MB</option>
              </select>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t("splitBySize.hint")}</p>
          </ToolCard>

          <ToolCard>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded mb-3">
                {error}
              </p>
            )}
            {progress && <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{progress}</p>}
            <PrimaryButton onClick={handleSplit} loading={processing}>
              <span className="material-symbols-outlined text-[18px]">storage</span>
              {t("splitBySize.button")}
            </PrimaryButton>
          </ToolCard>
        </div>
      )}
    </ToolLayout>
  );
}
