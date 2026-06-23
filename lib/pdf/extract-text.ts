import { loadPdfDocument } from "./core";
import { yieldToMain } from "./engine/memory";

/** Extract all text from a PDF, grouped by page. */
export async function extractTextFromPdf(
  buffer: ArrayBuffer,
  onProgress?: (page: number, total: number) => void
): Promise<string> {
  const pdf = await loadPdfDocument(buffer);
  const parts: string[] = [];

  try {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      onProgress?.(pageNum, pdf.numPages);
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const line = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      parts.push(`--- Page ${pageNum} ---\n${line || "(no extractable text)"}\n`);
      if (pageNum < pdf.numPages) await yieldToMain();
    }
  } finally {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  }

  return parts.join("\n").trim();
}
