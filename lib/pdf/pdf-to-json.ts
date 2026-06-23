import { loadPdfDocument } from "./core";
import { getPdfMetadata, type PdfMetadata } from "./metadata";
import { yieldToMain } from "./engine/memory";

export interface PdfJsonExport {
  metadata: PdfMetadata;
  pages: string[];
}

/** Export metadata and per-page text as a JSON-serializable object. */
export async function pdfToJson(buffer: ArrayBuffer): Promise<PdfJsonExport> {
  const metadata = await getPdfMetadata(buffer);
  const pdf = await loadPdfDocument(buffer);
  const pages: string[] = [];

  try {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      pages.push(text);
      if (pageNum < pdf.numPages) await yieldToMain();
    }
  } finally {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  }

  return { metadata, pages };
}
