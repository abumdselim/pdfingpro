import { PdfSession } from "./engine/session";
import { releaseCanvas, yieldToMain } from "./engine/memory";

export interface OcrProgress {
  page: number;
  total: number;
  status: string;
}

/**
 * Run Tesseract OCR on every page of a PDF and return extracted text.
 * Pages are rendered and released one at a time to limit memory use.
 */
export async function ocrPDF(
  arrayBuffer: ArrayBuffer,
  language = "eng",
  onProgress?: (p: OcrProgress) => void
): Promise<string> {
  const Tesseract = (await import("tesseract.js")).default;
  const session = await PdfSession.fromBuffer(arrayBuffer);

  try {
    const total = session.pageCount;
    const textParts: string[] = [];

    for (let i = 1; i <= total; i++) {
      onProgress?.({ page: i, total, status: "rendering" });
      const canvas = await session.renderPage(i, 2.0);
      const dataUrl = canvas.toDataURL("image/png");
      releaseCanvas(canvas);

      onProgress?.({ page: i, total, status: "recognizing" });
      const result = await Tesseract.recognize(dataUrl, language, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            onProgress?.({
              page: i,
              total,
              status: `recognizing (${Math.round(m.progress * 100)}%)`,
            });
          }
        },
      });

      textParts.push(`=== Page ${i} ===\n${result.data.text}`);

      if (session.profile.yieldMs > 0) {
        await yieldToMain(session.profile.yieldMs);
      } else {
        await yieldToMain();
      }
    }

    return textParts.join("\n\n");
  } finally {
    session.destroy();
  }
}
