import { mergePDFs } from "./merge";
import { compressPDF, type CompressionLevel } from "./compress";
import { flattenPdf } from "./flatten";
import { grayscalePdf } from "./filters";
import { rotatePDF, type RotationAngle } from "./rotate";

export type BatchWorkflowStep = "merge" | "compress" | "flatten" | "grayscale" | "rotate";

export interface BatchWorkflowInput {
  files: ArrayBuffer[];
  steps: BatchWorkflowStep[];
  compressionLevel?: CompressionLevel;
  rotation?: RotationAngle;
  onProgress?: (step: string, percent: number) => void;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

/** Run an advanced multi-step PDF pipeline in the browser. */
export async function runBatchWorkflow(input: BatchWorkflowInput): Promise<Uint8Array> {
  const { files, steps, compressionLevel = "medium", rotation = 90, onProgress } = input;
  if (files.length === 0) throw new Error("No input files provided.");
  if (steps.length === 0) throw new Error("Select at least one workflow step.");

  let current: Uint8Array;
  const stepCount = steps.length;
  let stepIndex = 0;

  const report = (label: string, pct: number) => {
    const base = Math.round((stepIndex / stepCount) * 100);
    const slice = Math.round(pct / stepCount);
    onProgress?.(label, Math.min(100, base + slice));
  };

  if (steps.includes("merge")) {
    report("merge", 5);
    current =
      files.length < 2
        ? new Uint8Array(files[0])
        : await mergePDFs(files, (page, total) => report("merge", Math.round((page / total) * 90)));
    stepIndex += 1;
  } else {
    current = new Uint8Array(files[0]);
  }

  for (const step of steps.filter((s) => s !== "merge")) {
    const buffer = toArrayBuffer(current);

    if (step === "compress") {
      report("compress", 10);
      current = await compressPDF(buffer, compressionLevel, (page, total) =>
        report("compress", 10 + Math.round((page / total) * 80))
      );
    } else if (step === "flatten") {
      report("flatten", 10);
      current = await flattenPdf(buffer, (page, total) =>
        report("flatten", 10 + Math.round((page / total) * 80))
      );
    } else if (step === "grayscale") {
      report("grayscale", 10);
      current = await grayscalePdf(buffer, (page, total) =>
        report("grayscale", 10 + Math.round((page / total) * 80))
      );
    } else if (step === "rotate") {
      report("rotate", 50);
      current = await rotatePDF(buffer, rotation);
      report("rotate", 95);
    }

    stepIndex += 1;
  }

  onProgress?.("done", 100);
  return current;
}
