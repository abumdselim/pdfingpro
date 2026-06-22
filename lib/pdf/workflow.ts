import { mergePDFs } from "./merge";
import { compressPDF, type CompressionLevel } from "./compress";

export type WorkflowStep = "merge" | "compress";

export interface WorkflowInput {
  files: ArrayBuffer[];
  steps: WorkflowStep[];
  compressionLevel?: CompressionLevel;
  onProgress?: (step: string, percent: number) => void;
}

/** Run a simple multi-step PDF pipeline (merge → compress). */
export async function runPdfWorkflow(input: WorkflowInput): Promise<Uint8Array> {
  const { files, steps, compressionLevel = "medium", onProgress } = input;
  if (files.length === 0) throw new Error("No input files provided.");

  let current: Uint8Array;

  if (steps.includes("merge")) {
    onProgress?.("merge", 10);
    if (files.length < 2) {
      current = new Uint8Array(files[0]);
    } else {
      current = await mergePDFs(files, (i, total) => {
        onProgress?.("merge", Math.round((i / total) * 50));
      });
    }
  } else {
    current = new Uint8Array(files[0]);
  }

  if (steps.includes("compress")) {
    onProgress?.("compress", 55);
    const buffer = current.buffer.slice(current.byteOffset, current.byteOffset + current.byteLength) as ArrayBuffer;
    current = await compressPDF(buffer, compressionLevel, (page, total) => {
      onProgress?.("compress", 55 + Math.round((page / total) * 45));
    });
  }

  onProgress?.("done", 100);
  return current;
}
