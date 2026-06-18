import { PDFDocument } from "pdf-lib";
import { PdfSession } from "./engine/session";
import { canvasToBytes, releaseCanvas, yieldToMain } from "./engine/memory";

export type CompressionLevel = "low" | "medium" | "high";

const QUALITY_MAP: Record<CompressionLevel, number> = {
  low: 0.85,
  medium: 0.65,
  high: 0.4,
};

const SCALE_MAP: Record<CompressionLevel, number> = {
  low: 1.2,
  medium: 1.0,
  high: 0.8,
};

/**
 * Compress a PDF by re-rendering each page to JPEG at reduced quality.
 * Uses a single PdfSession so large files are not re-parsed per page.
 */
export async function compressPDF(
  arrayBuffer: ArrayBuffer,
  level: CompressionLevel = "medium",
  onProgress?: (page: number, total: number) => void
): Promise<Uint8Array> {
  const session = await PdfSession.fromBuffer(arrayBuffer);
  const quality = QUALITY_MAP[level];
  const scale = SCALE_MAP[level];

  try {
    const pageCount = session.pageCount;
    const outDoc = await PDFDocument.create();

    for (let i = 1; i <= pageCount; i++) {
      onProgress?.(i, pageCount);

      const canvas = await session.renderPage(i, scale);
      const width = canvas.width;
      const height = canvas.height;
      const imageBytes = await canvasToBytes(canvas, "image/jpeg", quality);
      releaseCanvas(canvas);

      const jpegImage = await outDoc.embedJpg(imageBytes);
      const page = outDoc.addPage([width, height]);
      page.drawImage(jpegImage, {
        x: 0,
        y: 0,
        width,
        height,
      });

      if (session.profile.yieldMs > 0) {
        await yieldToMain(session.profile.yieldMs);
      } else {
        await yieldToMain();
      }
    }

    return outDoc.save();
  } finally {
    session.destroy();
  }
}
