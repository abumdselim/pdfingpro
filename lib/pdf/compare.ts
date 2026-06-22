import { loadPdfDocument, renderPageFromDoc } from "./core";
import { yieldToMain } from "./engine/memory";

export interface ComparePageResult {
  pageNumber: number;
  leftDataUrl: string;
  rightDataUrl: string;
  leftWidth: number;
  leftHeight: number;
  rightWidth: number;
  rightHeight: number;
}

export interface CompareSummary {
  leftPageCount: number;
  rightPageCount: number;
  maxPages: number;
  pages: ComparePageResult[];
}

/** Render corresponding pages from two PDFs for side-by-side comparison. */
export async function comparePDFs(
  leftBuffer: ArrayBuffer,
  rightBuffer: ArrayBuffer,
  scale = 1.0,
  onProgress?: (page: number, total: number) => void
): Promise<CompareSummary> {
  const leftPdf = await loadPdfDocument(leftBuffer);
  const rightPdf = await loadPdfDocument(rightBuffer);

  const leftPageCount = leftPdf.numPages;
  const rightPageCount = rightPdf.numPages;
  const maxPages = Math.max(leftPageCount, rightPageCount);
  const pages: ComparePageResult[] = [];

  try {
    for (let i = 1; i <= maxPages; i++) {
      onProgress?.(i, maxPages);

      let leftDataUrl = "";
      let leftWidth = 0;
      let leftHeight = 0;
      let rightDataUrl = "";
      let rightWidth = 0;
      let rightHeight = 0;

      if (i <= leftPageCount) {
        const canvas = await renderPageFromDoc(leftPdf, i, scale);
        leftDataUrl = canvas.toDataURL("image/png");
        leftWidth = canvas.width;
        leftHeight = canvas.height;
      }

      if (i <= rightPageCount) {
        const canvas = await renderPageFromDoc(rightPdf, i, scale);
        rightDataUrl = canvas.toDataURL("image/png");
        rightWidth = canvas.width;
        rightHeight = canvas.height;
      }

      pages.push({
        pageNumber: i,
        leftDataUrl,
        rightDataUrl,
        leftWidth,
        leftHeight,
        rightWidth,
        rightHeight,
      });

      if (i < maxPages) await yieldToMain();
    }
  } finally {
    try {
      leftPdf.destroy();
      rightPdf.destroy();
    } catch {
      // ignore
    }
  }

  return { leftPageCount, rightPageCount, maxPages, pages };
}
