import { PDFDocument, rgb } from "pdf-lib";
import { loadPdfDocument } from "./core";
import { yieldToMain } from "./engine/memory";

/** Normalized redaction region (0–1, top-left origin). */
export interface RedactRegion {
  pageIndex: number;
  xFrac: number;
  yFrac: number;
  wFrac: number;
  hFrac: number;
}

export interface TextMatch {
  pageIndex: number;
  text: string;
  xFrac: number;
  yFrac: number;
  wFrac: number;
  hFrac: number;
}

export interface RedactSearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
}

/** @deprecated use RedactRegion */
export interface RedactBox {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function normalizeRegion(r: RedactRegion): RedactRegion {
  const x1 = clamp01(r.xFrac);
  const y1 = clamp01(r.yFrac);
  const x2 = clamp01(r.xFrac + r.wFrac);
  const y2 = clamp01(r.yFrac + r.hFrac);
  return {
    pageIndex: r.pageIndex,
    xFrac: Math.min(x1, x2),
    yFrac: Math.min(y1, y2),
    wFrac: Math.max(0.002, Math.abs(x2 - x1)),
    hFrac: Math.max(0.008, Math.abs(y2 - y1)),
  };
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSearchRegex(searchText: string, options: RedactSearchOptions): RegExp {
  const escaped = escapeRegex(searchText.trim());
  const flags = options.caseSensitive ? "g" : "gi";
  const pattern = options.wholeWord ? `\\b${escaped}\\b` : escaped;
  return new RegExp(pattern, flags);
}

type TextItem = { str: string; transform: number[]; width: number; height: number };

function groupItemsIntoLines(items: TextItem[], yTolerance = 4): TextItem[][] {
  const sorted = [...items].filter((i) => i.str.trim()).sort((a, b) => b.transform[5] - a.transform[5]);
  const lines: TextItem[][] = [];

  for (const item of sorted) {
    const y = item.transform[5];
    const line = lines.find((group) => Math.abs(group[0].transform[5] - y) <= yTolerance);
    if (line) line.push(item);
    else lines.push([item]);
  }

  for (const line of lines) {
    line.sort((a, b) => a.transform[4] - b.transform[4]);
  }
  return lines;
}

function itemBoxInFrac(
  item: TextItem,
  viewport: { width: number; height: number },
  paddingFrac = 0.003
): RedactRegion {
  const [, , , , tx, ty] = item.transform;
  const w = item.width || item.str.length * 6;
  const h = item.height || 12;
  const x = tx;
  const top = viewport.height - ty - h;
  return normalizeRegion({
    pageIndex: 0,
    xFrac: x / viewport.width - paddingFrac,
    yFrac: top / viewport.height - paddingFrac,
    wFrac: w / viewport.width + paddingFrac * 2,
    hFrac: h / viewport.height + paddingFrac * 2,
  });
}

function matchSpanToRegion(
  line: TextItem[],
  lineText: string,
  start: number,
  end: number,
  pageIndex: number,
  viewport: { width: number; height: number }
): RedactRegion | null {
  let cursor = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const item of line) {
    const itemStart = cursor;
    const itemEnd = cursor + item.str.length;
    cursor = itemEnd;

    if (itemEnd <= start || itemStart >= end) continue;

    const box = itemBoxInFrac(item, viewport, 0);
    const x1 = box.xFrac * viewport.width;
    const y1 = box.yFrac * viewport.height;
    const x2 = x1 + box.wFrac * viewport.width;
    const y2 = y1 + box.hFrac * viewport.height;
    minX = Math.min(minX, x1);
    minY = Math.min(minY, y1);
    maxX = Math.max(maxX, x2);
    maxY = Math.max(maxY, y2);
  }

  if (!Number.isFinite(minX)) return null;

  return normalizeRegion({
    pageIndex,
    xFrac: minX / viewport.width,
    yFrac: minY / viewport.height,
    wFrac: (maxX - minX) / viewport.width,
    hFrac: (maxY - minY) / viewport.height,
  });
}

/** Find text on all pages; supports phrase search across items on the same line. */
export async function findTextMatches(
  buffer: ArrayBuffer,
  searchText: string,
  options: RedactSearchOptions = {}
): Promise<TextMatch[]> {
  if (!searchText.trim()) return [];

  const pdf = await loadPdfDocument(buffer);
  const regex = buildSearchRegex(searchText, options);
  const matches: TextMatch[] = [];

  try {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1 });
      const pageIndex = pageNum - 1;
      const items = content.items as TextItem[];
      const lines = groupItemsIntoLines(items);

      for (const line of lines) {
        const lineText = line.map((i) => i.str).join("");
        regex.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(lineText)) !== null) {
          const region = matchSpanToRegion(line, lineText, m.index, m.index + m[0].length, pageIndex, viewport);
          if (region) {
            matches.push({
              pageIndex,
              text: m[0],
              xFrac: region.xFrac,
              yFrac: region.yFrac,
              wFrac: region.wFrac,
              hFrac: region.hFrac,
            });
          }
          if (!options.wholeWord && m[0].length === 0) break;
        }
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

export function matchesToRegions(matches: TextMatch[]): RedactRegion[] {
  return matches.map((m) =>
    normalizeRegion({
      pageIndex: m.pageIndex,
      xFrac: m.xFrac,
      yFrac: m.yFrac,
      wFrac: m.wFrac,
      hFrac: m.hFrac,
    })
  );
}

/** Draw black rectangles over regions (visual redaction; text layer may remain). */
export async function applyRedactions(buffer: ArrayBuffer, regions: RedactRegion[]): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const byPage = new Map<number, RedactRegion[]>();

  for (const raw of regions) {
    const region = normalizeRegion(raw);
    if (!byPage.has(region.pageIndex)) byPage.set(region.pageIndex, []);
    byPage.get(region.pageIndex)!.push(region);
  }

  for (const [pageIndex, pageRegions] of byPage) {
    const page = doc.getPage(pageIndex);
    const { width, height } = page.getSize();

    for (const region of pageRegions) {
      const n = normalizeRegion(region);
      const w = n.wFrac * width;
      const h = n.hFrac * height;
      const x = n.xFrac * width;
      const y = height - n.yFrac * height - h;

      page.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        color: rgb(0, 0, 0),
        borderWidth: 0,
      });
    }
  }

  return doc.save();
}

/** @deprecated */
export function textMatchesToBoxes(matches: TextMatch[], padding = 2): RedactBox[] {
  return matches.map((m) => ({
    page: m.pageIndex + 1,
    x: m.xFrac * 612 - padding,
    y: m.yFrac * 792 - padding,
    width: m.wFrac * 612 + padding * 2,
    height: m.hFrac * 792 + padding * 2,
  }));
}
