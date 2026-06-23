import { PDFDocument } from "pdf-lib";
import { PdfSession } from "./engine/session";
import { canvasToBytes, releaseCanvas, yieldToMain } from "./engine/memory";

/** Re-render every page to JPEG — burns forms, annotations, and vector content into images. */
export async function rasterizePdfPages(
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
      const width = canvas.width;
      const height = canvas.height;
      const imageBytes = await canvasToBytes(canvas, "image/jpeg", quality);
      releaseCanvas(canvas);

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
