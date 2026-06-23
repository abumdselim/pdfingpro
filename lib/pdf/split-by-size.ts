import { PDFDocument } from "pdf-lib";
import { yieldToMain } from "./engine/memory";

export interface SizeSplitOptions {
  maxBytes: number;
  onProgress?: (page: number, total: number) => void;
}

async function savePageRange(
  src: PDFDocument,
  from: number,
  to: number
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const indices = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const pages = await doc.copyPages(src, indices);
  pages.forEach((page) => doc.addPage(page));
  return doc.save();
}

/**
 * Split a PDF into multiple files so each part stays under maxBytes.
 */
export async function splitPDFBySize(
  arrayBuffer: ArrayBuffer,
  options: SizeSplitOptions
): Promise<{ bytes: Uint8Array; label: string }[]> {
  const { maxBytes, onProgress } = options;
  if (maxBytes < 50_000) {
    throw new Error("Size limit too small.");
  }

  const src = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const total = src.getPageCount();
  const results: { bytes: Uint8Array; label: string }[] = [];

  let start = 0;
  let part = 1;

  while (start < total) {
    let end = start;
    let lastValidEnd = start;

    while (end < total) {
      const bytes = await savePageRange(src, start, end);
      if (bytes.byteLength > maxBytes) break;
      lastValidEnd = end;
      end += 1;
    }

    if (lastValidEnd === start && end === start) {
      const bytes = await savePageRange(src, start, start);
      results.push({
        bytes,
        label: `part-${part}-page-${start + 1}`,
      });
      onProgress?.(start + 1, total);
      start += 1;
      part += 1;
    } else {
      const bytes = await savePageRange(src, start, lastValidEnd);
      results.push({
        bytes,
        label: `part-${part}-pages-${start + 1}-${lastValidEnd + 1}`,
      });
      onProgress?.(lastValidEnd + 1, total);
      start = lastValidEnd + 1;
      part += 1;
    }

    await yieldToMain();
  }

  return results;
}

export function parseSizeLimit(input: string, unit: "KB" | "MB"): number | null {
  const value = Number(input.trim());
  if (!Number.isFinite(value) || value <= 0) return null;
  const multiplier = unit === "MB" ? 1024 * 1024 : 1024;
  return Math.round(value * multiplier);
}
