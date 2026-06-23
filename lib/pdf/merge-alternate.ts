import { PDFDocument } from "pdf-lib";
import { yieldToMain } from "./engine/memory";

/**
 * Interleave pages from two PDFs: A1, B1, A2, B2, …
 * Remaining pages from the longer file are appended at the end.
 */
export async function mergeAlternatePages(
  firstBuffer: ArrayBuffer,
  secondBuffer: ArrayBuffer,
  onProgress?: (page: number, total: number) => void
): Promise<Uint8Array> {
  const [first, second] = await Promise.all([
    PDFDocument.load(firstBuffer, { ignoreEncryption: true }),
    PDFDocument.load(secondBuffer, { ignoreEncryption: true }),
  ]);

  const merged = await PDFDocument.create();
  const countA = first.getPageCount();
  const countB = second.getPageCount();
  const max = Math.max(countA, countB);

  for (let i = 0; i < max; i++) {
    onProgress?.(i + 1, max);
    if (i < countA) {
      const [page] = await merged.copyPages(first, [i]);
      merged.addPage(page);
    }
    if (i < countB) {
      const [page] = await merged.copyPages(second, [i]);
      merged.addPage(page);
    }
    await yieldToMain();
  }

  return merged.save();
}
