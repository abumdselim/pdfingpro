import { PDFDocument } from "pdf-lib";
import { loadPdfDocument, renderPageFromDoc } from "./core";
import { canvasToBytes, releaseCanvas, yieldToMain } from "./engine/memory";

export type ImageCompressionLevel = "low" | "medium" | "high";

const QUALITY_MAP: Record<ImageCompressionLevel, number> = {
  low: 0.5,
  medium: 0.7,
  high: 0.85,
};

const RENDER_SCALE = 1.5;

/** True when pdf.js operator list includes embedded image paints. */
export function operatorListHasImages(fnArray: number[]): boolean {
  return fnArray.some((fn) => fn === 85 || fn === 86);
}

async function pageHasEmbeddedImages(
  pdf: Awaited<ReturnType<typeof loadPdfDocument>>,
  pageNumber: number
): Promise<boolean> {
  const page = await pdf.getPage(pageNumber);
  const ops = await page.getOperatorList();
  return operatorListHasImages(ops.fnArray);
}

/** Recompress pages that contain embedded images; copy text-only pages as vectors. */
export async function compressPdfImages(
  buffer: ArrayBuffer,
  level: ImageCompressionLevel = "medium",
  onProgress?: (page: number, total: number) => void
): Promise<Uint8Array> {
  const quality = QUALITY_MAP[level];
  const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const total = src.getPageCount();

  if (typeof document === "undefined") {
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((page) => out.addPage(page));
    return out.save({ useObjectStreams: false });
  }

  const pdf = await loadPdfDocument(buffer);
  const out = await PDFDocument.create();

  try {
    for (let i = 0; i < total; i++) {
      onProgress?.(i + 1, total);
      const srcPage = src.getPage(i);
      const { width, height } = srcPage.getSize();
      const hasImages = await pageHasEmbeddedImages(pdf, i + 1);

      if (hasImages) {
        const canvas = await renderPageFromDoc(pdf, i + 1, RENDER_SCALE);
        const imageBytes = await canvasToBytes(canvas, "image/jpeg", quality);
        releaseCanvas(canvas);
        const jpeg = await out.embedJpg(imageBytes);
        const page = out.addPage([width, height]);
        page.drawImage(jpeg, { x: 0, y: 0, width, height });
      } else {
        const embedded = await out.embedPage(srcPage);
        const page = out.addPage([width, height]);
        page.drawPage(embedded, { x: 0, y: 0, width, height });
      }

      if (i + 1 < total) await yieldToMain();
    }

    return out.save({ useObjectStreams: false });
  } finally {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  }
}
