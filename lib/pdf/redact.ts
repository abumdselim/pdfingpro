import { PDFDocument, rgb } from "pdf-lib";
import { loadPdfDocument } from "./core";
import { yieldToMain } from "./engine/memory";

export interface RedactBox {
  page: number; // 1-based
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextMatch {
  page: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Find text matches on all pages (case-insensitive). */
export async function findTextMatches(
  buffer: ArrayBuffer,
  searchText: string
): Promise<TextMatch[]> {
  if (!searchText.trim()) return [];
  const pdf = await loadPdfDocument(buffer);
  const needle = searchText.toLowerCase();
  const matches: TextMatch[] = [];

  try {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1 });

      for (const item of content.items as Array<{ str: string; transform: number[]; width: number; height: number }>) {
        if (!item.str.toLowerCase().includes(needle)) continue;
        const [, , , , tx, ty] = item.transform;
        const x = tx;
        const y = viewport.height - ty;
        const w = item.width || item.str.length * 6;
        const h = item.height || 12;
        matches.push({ page: pageNum, text: item.str, x, y: y - h, width: w, height: h });
      }

      if (pageNum < pdf.numPages) await yieldToMain();
    }
  } finally {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  }

  return matches;
}

/** Draw black rectangles over specified regions. */
export async function applyRedactions(
  buffer: ArrayBuffer,
  boxes: RedactBox[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const byPage = new Map<number, RedactBox[]>();

  for (const box of boxes) {
    if (!byPage.has(box.page)) byPage.set(box.page, []);
    byPage.get(box.page)!.push(box);
  }

  for (const [pageNum, pageBoxes] of byPage) {
    const page = doc.getPage(pageNum - 1);
    const { height } = page.getSize();

    for (const box of pageBoxes) {
      page.drawRectangle({
        x: box.x,
        y: height - box.y - box.height,
        width: box.width,
        height: box.height,
        color: rgb(0, 0, 0),
        borderWidth: 0,
      });
    }
  }

  return doc.save();
}

export function textMatchesToBoxes(matches: TextMatch[], padding = 2): RedactBox[] {
  return matches.map((m) => ({
    page: m.page,
    x: m.x - padding,
    y: m.y - padding,
    width: m.width + padding * 2,
    height: m.height + padding * 2,
  }));
}
