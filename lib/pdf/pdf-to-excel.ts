import { loadPdfDocument } from "./core";
import { yieldToMain } from "./engine/memory";

export interface PageTextRow {
  page: number;
  line: string;
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Extract text from each page and format as CSV (opens in Excel). */
export async function pdfToCsv(
  buffer: ArrayBuffer,
  onProgress?: (page: number, total: number) => void
): Promise<string> {
  const pdf = await loadPdfDocument(buffer);
  const rows: string[] = ["Page,Line,Text"];

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress?.(i, pdf.numPages);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const lines = new Map<number, string[]>();
      for (const item of content.items as Array<{ str: string; transform: number[] }>) {
        const y = Math.round(item.transform[5]);
        if (!lines.has(y)) lines.set(y, []);
        lines.get(y)!.push(item.str);
      }

      const sortedY = Array.from(lines.keys()).sort((a, b) => b - a);
      let lineNum = 0;
      for (const y of sortedY) {
        const text = lines.get(y)!.join(" ").trim();
        if (!text) continue;
        lineNum++;
        rows.push(`${i},${lineNum},${escapeCsvCell(text)}`);
      }

      if (i < pdf.numPages) await yieldToMain();
    }
  } finally {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  }

  return rows.join("\r\n");
}

/** Alias for spreadsheet export — CSV opens directly in Excel. */
export async function pdfToExcel(
  buffer: ArrayBuffer,
  onProgress?: (page: number, total: number) => void
): Promise<{ csv: string; filename: string }> {
  const csv = await pdfToCsv(buffer, onProgress);
  return { csv, filename: "extracted.csv" };
}
