import { loadPdfDocument } from "./core";
import { reorganizePages } from "./organize";
import { yieldToMain } from "./engine/memory";

export interface RemoveBlankPagesOptions {
  /** Minimum non-whitespace characters to keep a page. */
  minTextLength?: number;
  /** Sample pixel non-whiteness ratio (0–1) above which an image-only page is kept. */
  inkThreshold?: number;
}

async function pageInkRatio(buffer: ArrayBuffer, pageNum: number): Promise<number> {
  if (typeof document === "undefined") return 0;
  const pdf = await loadPdfDocument(buffer);
  try {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 0.2 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) return 1;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let dark = 0;
    const step = 4;
    for (let i = 0; i < data.length; i += 4 * step) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < 245) dark += 1;
    }
    const samples = Math.ceil((width * height) / step);
    return dark / Math.max(1, samples);
  } finally {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  }
}

/** Drop pages with no meaningful text and almost no visible ink. */
export async function removeBlankPages(
  buffer: ArrayBuffer,
  options: RemoveBlankPagesOptions = {},
  onProgress?: (page: number, total: number) => void
): Promise<{ bytes: Uint8Array; removed: number; kept: number[] }> {
  const minTextLength = options.minTextLength ?? 1;
  const inkThreshold = options.inkThreshold ?? 0.002;

  const pdf = await loadPdfDocument(buffer);
  const keep: number[] = [];

  try {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      onProgress?.(pageNum, pdf.numPages);
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join("")
        .replace(/\s+/g, "")
        .trim();

      let keepPage = text.length >= minTextLength;
      if (!keepPage) {
        const ink = await pageInkRatio(buffer, pageNum);
        keepPage = ink >= inkThreshold;
      }

      if (keepPage) keep.push(pageNum - 1);
      if (pageNum < pdf.numPages) await yieldToMain();
    }
  } finally {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  }

  if (keep.length === 0) {
    throw new Error("All pages appear blank. Nothing to save.");
  }

  const bytes = await reorganizePages(buffer, keep);
  return { bytes, removed: pdf.numPages - keep.length, kept: keep };
}
