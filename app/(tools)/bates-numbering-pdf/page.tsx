"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { addBatesNumbers } from "@/lib/pdf/bates";
import { downloadBlob, getBaseName } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function BatesNumberingPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [prefix, setPrefix] = useState("BATES-");
  const [startAt, setStartAt] = useState("1");
  const [digits, setDigits] = useState("6");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!file) return;
    const start = Number(startAt);
    const pad = Number(digits);
    if (!Number.isInteger(start) || start < 0 || !Number.isInteger(pad) || pad < 1 || pad > 12) {
      setError(t("batesNumbering.invalid"));
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const bytes = await addBatesNumbers(await file.arrayBuffer(), {
        prefix,
        startAt: start,
        digits: pad,
      });
      setResult({ blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }), filename: `${getBaseName(file.name)}-bates.pdf` });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("batesNumbering.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setError(null); };

  return (
    <ToolLayout title={t("tools.batesNumberingPdf.title")} description={t("batesNumbering.pageDescription")} icon="tag" iconClass="bg-slate-50 text-slate-700">
      {result ? (
        <ToolCard><DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} /></ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard><FileDropzone onFiles={(f) => setFile(f[0])} files={file ? [file] : []} /></ToolCard>
          {file && (
            <ToolCard className="space-y-4">
              <label className="block text-sm font-semibold">{t("batesNumbering.prefix")}<input value={prefix} onChange={(e) => setPrefix(e.target.value)} className="ds-input mt-1" /></label>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block text-sm font-semibold">{t("batesNumbering.start")}<input type="number" min={0} value={startAt} onChange={(e) => setStartAt(e.target.value)} className="ds-input mt-1" /></label>
                <label className="block text-sm font-semibold">{t("batesNumbering.digits")}<input type="number" min={1} max={12} value={digits} onChange={(e) => setDigits(e.target.value)} className="ds-input mt-1" /></label>
              </div>
              <p className="text-xs text-slate-500">{t("batesNumbering.preview", { sample: `${prefix}${String(Number(startAt) || 1).padStart(Number(digits) || 6, "0")}` })}</p>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleApply} loading={processing}>{t("batesNumbering.button")}</PrimaryButton>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
