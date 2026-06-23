"use client";

import { useState } from "react";
import ToolLayout, { ToolCard, PrimaryButton, DownloadSuccess, ProgressBar } from "@/components/shared/ToolLayout";
import FileDropzone from "@/components/shared/FileDropzone";
import { runBatchWorkflow, type BatchWorkflowStep } from "@/lib/pdf/batch-workflow";
import { type CompressionLevel } from "@/lib/pdf/compress";
import { type RotationAngle } from "@/lib/pdf/rotate";
import { downloadBlob } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const STEP_OPTIONS: { id: BatchWorkflowStep; labelKey: string }[] = [
  { id: "merge", labelKey: "batchWorkflow.merge" },
  { id: "compress", labelKey: "batchWorkflow.compress" },
  { id: "flatten", labelKey: "batchWorkflow.flatten" },
  { id: "grayscale", labelKey: "batchWorkflow.grayscale" },
  { id: "rotate", labelKey: "batchWorkflow.rotate" },
];

export default function BatchWorkflowPage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [steps, setSteps] = useState<Set<BatchWorkflowStep>>(new Set(["merge", "compress"]));
  const [level, setLevel] = useState<CompressionLevel>("medium");
  const [rotation, setRotation] = useState<RotationAngle>(90);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState("");
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleStep = (step: BatchWorkflowStep) => {
    setSteps((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  };

  const handleRun = async () => {
    if (files.length === 0 || steps.size === 0) return;
    setProcessing(true);
    setError(null);
    setProgress(0);
    try {
      const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
      const orderedSteps = STEP_OPTIONS.map((s) => s.id).filter((s) => steps.has(s));
      const bytes = await runBatchWorkflow({
        files: buffers,
        steps: orderedSteps,
        compressionLevel: level,
        rotation,
        onProgress: (step, pct) => {
          setStepLabel(step);
          setProgress(pct);
        },
      });
      setResult({ blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }), filename: "batch-output.pdf" });
    } catch (err: unknown) {
      setError((err as Error)?.message ?? t("batchWorkflow.error"));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  const LEVELS: CompressionLevel[] = ["low", "medium", "high"];
  const ROTATIONS: RotationAngle[] = [90, 180, 270];

  return (
    <ToolLayout
      title={t("tools.batchWorkflow.title")}
      description={t("batchWorkflow.pageDescription")}
      icon="account_tree"
      iconClass="bg-blue-50 text-blue-700"
    >
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
                  <li key={`${f.name}-${i}`} className="text-sm text-slate-600 flex justify-between">
                    <span className="truncate">{f.name}</span>
                    <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-red-500 ml-2">×</button>
                  </li>
                ))}
              </ul>
            )}
          </ToolCard>

          {files.length > 0 && (
            <ToolCard className="space-y-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("batchWorkflow.steps")}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {STEP_OPTIONS.map(({ id, labelKey }) => (
                  <label key={id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={steps.has(id)}
                      onChange={() => toggleStep(id)}
                      disabled={id === "merge" && files.length < 2}
                    />
                    {t(labelKey)}
                    {id === "merge" && files.length < 2 && (
                      <span className="text-xs text-slate-400">({t("batchWorkflow.needsTwo")})</span>
                    )}
                  </label>
                ))}
              </div>

              {steps.has("compress") && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">{t("batchWorkflow.level")}</p>
                  <div className="flex gap-2">
                    {LEVELS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLevel(l)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-lg border capitalize",
                          level === l ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {steps.has("rotate") && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">{t("batchWorkflow.rotation")}</p>
                  <div className="flex gap-2">
                    {ROTATIONS.map((angle) => (
                      <button
                        key={angle}
                        type="button"
                        onClick={() => setRotation(angle)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-lg border",
                          rotation === angle ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200"
                        )}
                      >
                        {angle}°
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {processing && <ProgressBar value={progress} label={stepLabel} />}
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">{error}</p>}
              <PrimaryButton onClick={handleRun} loading={processing} disabled={steps.size === 0}>
                <span className="material-symbols-outlined text-[18px]">account_tree</span>
                {t("batchWorkflow.run")}
              </PrimaryButton>
            </ToolCard>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
