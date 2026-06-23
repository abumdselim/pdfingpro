import { loadPdfDocument, renderPageFromDoc } from "./core";
import { releaseCanvas, yieldToMain } from "./engine/memory";

export interface VisualDiffPageResult {
  pageNumber: number;
  matchPercent: number;
  diffPixelCount: number;
  totalPixels: number;
  leftDataUrl: string;
  rightDataUrl: string;
  diffDataUrl: string;
}

export interface VisualDiffSummary {
  leftPageCount: number;
  rightPageCount: number;
  pages: VisualDiffPageResult[];
  averageMatchPercent: number;
}

function normalizeCanvas(
  source: HTMLCanvasElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

function buildDiffCanvas(left: HTMLCanvasElement, right: HTMLCanvasElement): {
  canvas: HTMLCanvasElement;
  matchPercent: number;
  diffPixelCount: number;
  totalPixels: number;
} {
  const width = Math.max(left.width, right.width);
  const height = Math.max(left.height, right.height);
  const leftNorm = normalizeCanvas(left, width, height);
  const rightNorm = normalizeCanvas(right, width, height);

  const diff = document.createElement("canvas");
  diff.width = width;
  diff.height = height;
  const ctx = diff.getContext("2d")!;

  const leftData = leftNorm.getContext("2d")!.getImageData(0, 0, width, height);
  const rightData = rightNorm.getContext("2d")!.getImageData(0, 0, width, height);
  const out = ctx.createImageData(width, height);

  let diffPixels = 0;
  const threshold = 18;

  for (let i = 0; i < leftData.data.length; i += 4) {
    const dr = Math.abs(leftData.data[i] - rightData.data[i]);
    const dg = Math.abs(leftData.data[i + 1] - rightData.data[i + 1]);
    const db = Math.abs(leftData.data[i + 2] - rightData.data[i + 2]);
    const changed = dr + dg + db > threshold;

    if (changed) {
      diffPixels += 1;
      out.data[i] = 239;
      out.data[i + 1] = 68;
      out.data[i + 2] = 68;
      out.data[i + 3] = 220;
    } else {
      const gray = Math.round(
        (leftData.data[i] + leftData.data[i + 1] + leftData.data[i + 2]) / 3
      );
      out.data[i] = gray;
      out.data[i + 1] = gray;
      out.data[i + 2] = gray;
      out.data[i + 3] = 90;
    }
  }

  ctx.putImageData(out, 0, 0);
  const totalPixels = width * height;
  const matchPercent = totalPixels === 0 ? 100 : ((totalPixels - diffPixels) / totalPixels) * 100;

  releaseCanvas(leftNorm);
  releaseCanvas(rightNorm);

  return {
    canvas: diff,
    matchPercent,
    diffPixelCount: diffPixels,
    totalPixels,
  };
}

/** Pixel-level visual diff with overlay highlighting for two PDFs. */
export async function visualDiffPDFs(
  leftBuffer: ArrayBuffer,
  rightBuffer: ArrayBuffer,
  scale = 0.75,
  onProgress?: (page: number, total: number) => void
): Promise<VisualDiffSummary> {
  const leftPdf = await loadPdfDocument(leftBuffer);
  const rightPdf = await loadPdfDocument(rightBuffer);

  const leftPageCount = leftPdf.numPages;
  const rightPageCount = rightPdf.numPages;
  const maxPages = Math.max(leftPageCount, rightPageCount);
  const pages: VisualDiffPageResult[] = [];

  try {
    for (let i = 1; i <= maxPages; i++) {
      onProgress?.(i, maxPages);

      let leftCanvas: HTMLCanvasElement | null = null;
      let rightCanvas: HTMLCanvasElement | null = null;

      if (i <= leftPageCount) {
        leftCanvas = await renderPageFromDoc(leftPdf, i, scale);
      }
      if (i <= rightPageCount) {
        rightCanvas = await renderPageFromDoc(rightPdf, i, scale);
      }

      const width = Math.max(leftCanvas?.width ?? 0, rightCanvas?.width ?? 0, 1);
      const height = Math.max(leftCanvas?.height ?? 0, rightCanvas?.height ?? 0, 1);
      const blank = document.createElement("canvas");
      blank.width = width;
      blank.height = height;
      blank.getContext("2d")!.fillStyle = "#ffffff";
      blank.getContext("2d")!.fillRect(0, 0, width, height);

      const left = leftCanvas ?? blank;
      const right = rightCanvas ?? blank;
      const { canvas: diffCanvas, matchPercent, diffPixelCount, totalPixels } = buildDiffCanvas(left, right);

      pages.push({
        pageNumber: i,
        matchPercent,
        diffPixelCount,
        totalPixels,
        leftDataUrl: left.toDataURL("image/png"),
        rightDataUrl: right.toDataURL("image/png"),
        diffDataUrl: diffCanvas.toDataURL("image/png"),
      });

      if (leftCanvas) releaseCanvas(leftCanvas);
      if (rightCanvas) releaseCanvas(rightCanvas);
      releaseCanvas(diffCanvas);
      if (leftCanvas !== blank && rightCanvas !== blank) {
        releaseCanvas(blank);
      }

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

  const averageMatchPercent =
    pages.length === 0 ? 100 : pages.reduce((sum, page) => sum + page.matchPercent, 0) / pages.length;

  return { leftPageCount, rightPageCount, pages, averageMatchPercent };
}
