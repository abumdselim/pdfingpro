import { loadPdfDocument } from "./core";
import { yieldToMain } from "./engine/memory";

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Export per-page text from a PDF as CSV (page, text columns). */
export async function pdfToCsv(buffer: ArrayBuffer): Promise<string> {
  const pdf = await loadPdfDocument(buffer);
  const rows = ["page,text"];

  try {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      rows.push(`${pageNum},${escapeCsv(text || "")}`);
      if (pageNum < pdf.numPages) await yieldToMain();
    }
  } finally {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  }

  return rows.join("\n");
}
