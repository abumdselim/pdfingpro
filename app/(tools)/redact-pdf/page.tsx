"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { findTextMatches, applyRedactions, textMatchesToBoxes, type RedactBox } from "@/lib/pdf/redact";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function RedactPdfPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [boxes, setBoxes] = useState<RedactBox[]>([]);
  const [searchText, setSearchText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!file || !searchText.trim()) return;
    setProcessing(true);
    setError(null);
    try {
      const matches = await findTextMatches(await file.arrayBuffer(), searchText);
      setBoxes((prev) => [...prev, ...textMatchesToBoxes(matches)]);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("redact.error"));
    } finally {
      setProcessing(false);
    }
  };

  const addManualBox = () => {
    setBoxes((prev) => [...prev, { page: 1, x: 72, y: 600, width: 200, height: 20 }]);
  };

  const handleApply = async () => {
    if (!file || boxes.length === 0) return;
    setProcessing(true);
    setError(null);
    try {
      const bytes = await applyRedactions(await file.arrayBuffer(), boxes);
      setResult({ blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }), filename: `${getBaseName(file.name)}-redacted.pdf` });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("redact.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setBoxes([]); setResult(null); setError(null); setSearchText(""); };

  return (
    <ToolLayout title={t("tools.redactPdf.title")} description={t("redact.pageDescription")} icon="visibility_off" iconClass="bg-neutral-50 text-neutral-600">
      {result ? (
        <ToolCard>
          <DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} />
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <FileDropzone onFiles={(f) => { setFile(f[0]); setBoxes([]); setError(null); }} files={file ? [file] : []} />
          </ToolCard>
          {file && (
            <>
              <ToolCard className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("redact.search")}</p>
                  <div className="flex gap-2">
                    <input
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder={t("redact.searchPlaceholder")}
                      className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                    />
                    <PrimaryButton onClick={handleSearch} loading={processing} className="!px-4 !py-2">
                      {t("redact.find")}
                    </PrimaryButton>
                  </div>
                </div>
                <button type="button" onClick={addManualBox} className="text-sm text-teal-600 font-semibold hover:underline">
                  + {t("redact.addBox")}
                </button>
                {boxes.length > 0 && (
                  <div className="space-y-1 max-h-40 overflow-auto">
                    <p className="text-xs font-semibold text-slate-500">{t("redact.boxes")} ({boxes.length})</p>
                    {boxes.map((b, i) => (
                      <div key={i} className="text-xs text-slate-600 dark:text-slate-400 flex justify-between">
                        <span>{t("redact.page", { page: b.page })} — {Math.round(b.width)}×{Math.round(b.height)}</span>
                        <button type="button" onClick={() => setBoxes((prev) => prev.filter((_, j) => j !== i))} className="text-red-500">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </ToolCard>
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleApply} loading={processing} disabled={boxes.length === 0}>
                <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                {t("redact.apply")}
              </PrimaryButton>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
