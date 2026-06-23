import { PDFDocument } from "pdf-lib";
import { PdfSession } from "./engine/session";
import { canvasToBytes, releaseCanvas, yieldToMain } from "./engine/memory";

function flipCanvasHorizontal(source: HTMLCanvasElement): HTMLCanvasElement {
  const flipped = document.createElement("canvas");
  flipped.width = source.width;
  flipped.height = source.height;
  const ctx = flipped.getContext("2d")!;
  ctx.translate(flipped.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(source, 0, 0);
  return flipped;
}

/** Flip every page horizontally via rasterization. */
export async function mirrorPdfPages(
  buffer: ArrayBuffer,
  scale = 2,
  quality = 0.92,
  onProgress?: (page: number, total: number) => void
): Promise<Uint8Array> {
  const session = await PdfSession.fromBuffer(buffer);

  try {
    const outDoc = await PDFDocument.create();
    const total = session.pageCount;

    for (let i = 1; i <= total; i++) {
      onProgress?.(i, total);
      const canvas = await session.renderPage(i, scale);
      const flipped = flipCanvasHorizontal(canvas);
      releaseCanvas(canvas);

      const width = flipped.width;
      const height = flipped.height;
      const imageBytes = await canvasToBytes(flipped, "image/jpeg", quality);
      releaseCanvas(flipped);

      const jpeg = await outDoc.embedJpg(imageBytes);
      const page = outDoc.addPage([width, height]);
      page.drawImage(jpeg, { x: 0, y: 0, width, height });

      if (session.profile.yieldMs > 0) await yieldToMain(session.profile.yieldMs);
      else await yieldToMain();
    }

    return outDoc.save();
  } finally {
    session.destroy();
  }
}
