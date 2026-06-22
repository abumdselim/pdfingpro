"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess, ProgressBar } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { runPdfWorkflow } from "@/lib/pdf/workflow";
import { type CompressionLevel } from "@/lib/pdf/compress";
import { downloadBlob } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function PdfWorkflowPage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [doMerge, setDoMerge] = useState(true);
  const [doCompress, setDoCompress] = useState(true);
  const [level, setLevel] = useState<CompressionLevel>("medium");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState("");
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setProgress(0);
    try {
      const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
      const steps: ("merge" | "compress")[] = [];
      if (doMerge && files.length > 1) steps.push("merge");
      if (doCompress) steps.push("compress");
      if (steps.length === 0) steps.push("merge");

      const bytes = await runPdfWorkflow({
        files: buffers,
        steps,
        compressionLevel: level,
        onProgress: (step, pct) => { setStepLabel(step); setProgress(pct); },
      });
      setResult({ blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }), filename: "workflow-output.pdf" });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("workflow.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); };

  const LEVELS: CompressionLevel[] = ["low", "medium", "high"];

  return (
    <ToolLayout title={t("tools.pdfWorkflow.title")} description={t("workflow.pageDescription")} icon="account_tree" iconClass="bg-blue-50 text-blue-600">
      {result ? (
        <ToolCard>
          <DownloadSuccess onDownload={() => downloadBlob(result.blob, result.filename)} onReset={reset} filename={result.filename} />
        </ToolCard>
      ) : (
        <div className="space-y-4">
          <ToolCard>
            <FileDropzone onFiles={(f) => { setFiles((prev) => [...prev, ...f]); setError(null); }} files={[]} maxFiles={20} />
            {files.length > 0 && (
              <ul className="mt-3 space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="text-sm text-slate-600 flex justify-between">
                    <span className="truncate">{f.name}</span>
                    <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-red-500 ml-2">×</button>
                  </li>
                ))}
              </ul>
            )}
          </ToolCard>

          {files.length > 0 && (
            <ToolCard className="space-y-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("workflow.steps")}</p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={doMerge} onChange={(e) => setDoMerge(e.target.checked)} disabled={files.length < 2} />
                {t("workflow.merge")} {files.length < 2 && <span className="text-xs text-slate-400">(needs 2+ files)</span>}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={doCompress} onChange={(e) => setDoCompress(e.target.checked)} />
                {t("workflow.compress")}
              </label>
              {doCompress && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">{t("workflow.level")}</p>
                  <div className="flex gap-2">
                    {LEVELS.map((l) => (
                      <button key={l} type="button" onClick={() => setLevel(l)}
                        className={cn("px-3 py-1.5 text-xs rounded-lg border capitalize", level === l ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200")}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {processing && <ProgressBar value={progress} label={stepLabel} />}
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleRun} loading={processing}>
                <span className="material-symbols-outlined text-[18px]">account_tree</span>
                {t("workflow.run")}
              </PrimaryButton>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
