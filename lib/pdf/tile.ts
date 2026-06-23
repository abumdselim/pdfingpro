import { PDFDocument } from "pdf-lib";
import { loadPdfDocument, renderPageFromDoc } from "./core";
import { canvasToBytes, releaseCanvas, yieldToMain } from "./engine/memory";

function cropCanvas(
  source: HTMLCanvasElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(sw));
  canvas.height = Math.max(1, Math.floor(sh));
  canvas.getContext("2d")!.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Split each page into a `rows`×`cols` tile grid on separate pages. */
export async function tilePdf(
  buffer: ArrayBuffer,
  rows: number,
  cols: number,
  scale = 2,
  quality = 0.92,
  onProgress?: (page: number, total: number) => void
): Promise<Uint8Array> {
  if (rows < 1 || cols < 1) throw new Error("Rows and cols must be at least 1.");

  const pdf = await loadPdfDocument(buffer);
  const outDoc = await PDFDocument.create();

  try {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      onProgress?.(pageNum, pdf.numPages);
      const canvas = await renderPageFromDoc(pdf, pageNum, scale);

      const tileW = canvas.width / cols;
      const tileH = canvas.height / rows;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const tile = cropCanvas(canvas, col * tileW, row * tileH, tileW, tileH);
          const bytes = await canvasToBytes(tile, "image/jpeg", quality);
          releaseCanvas(tile);

          const jpeg = await outDoc.embedJpg(bytes);
          const outPage = outDoc.addPage([tileW, tileH]);
          outPage.drawImage(jpeg, { x: 0, y: 0, width: tileW, height: tileH });
        }
      }

      releaseCanvas(canvas);
      if (pageNum < pdf.numPages) await yieldToMain();
    }
  } finally {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  }

  return outDoc.save();
}
