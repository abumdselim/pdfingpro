import { loadPdfDocument } from "./core";
import { PDFDocument } from "pdf-lib";
import { yieldToMain } from "./engine/memory";

export interface TextSplitOptions {
  searchText: string;
  caseSensitive?: boolean;
  onProgress?: (page: number, total: number) => void;
}

async function getPageText(
  pdf: Awaited<ReturnType<typeof loadPdfDocument>>,
  pageNum: number
): Promise<string> {
  const page = await pdf.getPage(pageNum);
  const content = await page.getTextContent();
  return content.items
    .map((item) => ("str" in item ? item.str : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function matches(text: string, search: string, caseSensitive: boolean): boolean {
  if (!search.trim()) return false;
  return caseSensitive
    ? text.includes(search)
    : text.toLowerCase().includes(search.toLowerCase());
}

/**
 * Split a PDF into sections whenever a page contains the search text.
 * The matching page starts a new section.
 */
export async function splitPdfByText(
  buffer: ArrayBuffer,
  options: TextSplitOptions
): Promise<{ bytes: Uint8Array; label: string }[]> {
  const { searchText, caseSensitive = false, onProgress } = options;
  if (!searchText.trim()) {
    throw new Error("Search text is required.");
  }

  const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pdf = await loadPdfDocument(buffer);
  const total = pdf.numPages;
  const ranges: { from: number; to: number; label: string }[] = [];
  let start = 1;
  let part = 1;

  try {
    for (let pageNum = 1; pageNum <= total; pageNum++) {
      onProgress?.(pageNum, total);
      const text = await getPageText(pdf, pageNum);

      if (pageNum > 1 && matches(text, searchText, caseSensitive)) {
        ranges.push({ from: start, to: pageNum - 1, label: `part-${part}` });
        part += 1;
        start = pageNum;
      }

      if (pageNum < total) await yieldToMain();
    }

    ranges.push({ from: start, to: total, label: `part-${part}` });
  } finally {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  }

  const results: { bytes: Uint8Array; label: string }[] = [];
  for (const range of ranges) {
    const doc = await PDFDocument.create();
    const indices = Array.from({ length: range.to - range.from + 1 }, (_, i) => range.from - 1 + i);
    const pages = await doc.copyPages(src, indices);
    pages.forEach((page) => doc.addPage(page));
    results.push({ bytes: await doc.save(), label: range.label });
  }

  return results;
}
