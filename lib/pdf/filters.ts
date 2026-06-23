import { PDFDocument } from "pdf-lib";
import { PdfSession } from "./engine/session";
import { canvasToBytes, releaseCanvas, yieldToMain } from "./engine/memory";

export type PageFilter = "grayscale" | "invert";

function applyPixelFilter(imageData: ImageData, filter: PageFilter) {
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (filter === "grayscale") {
      const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      d[i] = d[i + 1] = d[i + 2] = g;
    } else {
      d[i] = 255 - d[i];
      d[i + 1] = 255 - d[i + 1];
      d[i + 2] = 255 - d[i + 2];
    }
  }
}

/** Re-render each page with a color filter applied. */
export async function applyPdfPageFilter(
  buffer: ArrayBuffer,
  filter: PageFilter,
  scale = 2,
  onProgress?: (page: number, total: number) => void
): Promise<Uint8Array> {
  const session = await PdfSession.fromBuffer(buffer);

  try {
    const outDoc = await PDFDocument.create();
    const total = session.pageCount;

    for (let i = 1; i <= total; i++) {
      onProgress?.(i, total);
      const canvas = await session.renderPage(i, scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported.");

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      applyPixelFilter(imageData, filter);
      ctx.putImageData(imageData, 0, 0);

      const imageBytes = await canvasToBytes(canvas, "image/jpeg", 0.92);
      releaseCanvas(canvas);

      const jpeg = await outDoc.embedJpg(imageBytes);
      const page = outDoc.addPage([jpeg.width, jpeg.height]);
      page.drawImage(jpeg, { x: 0, y: 0, width: jpeg.width, height: jpeg.height });

      if (session.profile.yieldMs > 0) await yieldToMain(session.profile.yieldMs);
      else await yieldToMain();
    }

    return outDoc.save();
  } finally {
    session.destroy();
  }
}

export async function grayscalePdf(
  buffer: ArrayBuffer,
  onProgress?: (page: number, total: number) => void
) {
  return applyPdfPageFilter(buffer, "grayscale", 2, onProgress);
}

export async function invertPdf(
  buffer: ArrayBuffer,
  onProgress?: (page: number, total: number) => void
) {
  return applyPdfPageFilter(buffer, "invert", 2, onProgress);
}
