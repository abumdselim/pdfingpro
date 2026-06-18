import { PDFDocument } from "pdf-lib";
import { yieldToMain } from "./engine/memory";

/**
 * Merge multiple PDF files into one, preserving all pages in order.
 * Loads each source sequentially and yields between files for large merges.
 */
export async function mergePDFs(
  arrayBuffers: ArrayBuffer[],
  onProgress?: (fileIndex: number, totalFiles: number) => void
): Promise<Uint8Array> {
  const merged = await PDFDocument.create();

  for (let i = 0; i < arrayBuffers.length; i++) {
    onProgress?.(i + 1, arrayBuffers.length);
    const doc = await PDFDocument.load(arrayBuffers[i], { ignoreEncryption: true });
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
    await yieldToMain();
  }

  return merged.save();
}
