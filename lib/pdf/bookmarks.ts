import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFString,
  StandardFonts,
  rgb,
} from "pdf-lib";
import { loadPdfDocument } from "./core";
import type { SplitRange } from "./split";

export interface PdfBookmark {
  title: string;
  page: number;
}

export interface BookmarkEntry extends PdfBookmark {
  level?: number;
}

export function parseBookmarkLines(input: string, pageCount: number): BookmarkEntry[] | null {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const entries: BookmarkEntry[] = [];
  for (const line of lines) {
    const pipe = line.lastIndexOf("|");
    const tab = line.lastIndexOf("\t");
    const sep = pipe >= 0 ? pipe : tab;

    let title: string;
    let pageRaw: string;

    if (sep >= 0) {
      title = line.slice(0, sep).trim();
      pageRaw = line.slice(sep + 1).trim();
    } else {
      const match = line.match(/^(.*?)(?:\s+)(\d+)\s*$/);
      if (!match) return null;
      title = match[1].trim();
      pageRaw = match[2];
    }

    const page = Number(pageRaw);
    if (!title || !Number.isInteger(page) || page < 1 || page > pageCount) return null;
    entries.push({ title, page });
  }

  return entries;
}

export function bookmarkSplitRanges(
  bookmarks: PdfBookmark[],
  pageCount: number
): SplitRange[] {
  if (bookmarks.length === 0) return [];

  const sorted = [...bookmarks].sort((a, b) => a.page - b.page);
  const ranges: SplitRange[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const from = sorted[i].page;
    const to = i < sorted.length - 1 ? sorted[i + 1].page - 1 : pageCount;
    if (from > pageCount || to < from) continue;
    const slug = sorted[i].title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    ranges.push({ from, to, label: slug || `section-${from}` });
  }

  return ranges;
}

async function resolveDestPage(
  pdf: Awaited<ReturnType<typeof loadPdfDocument>>,
  dest: unknown
): Promise<number | null> {
  if (!dest) return null;

  if (typeof dest === "string") {
    const resolved = await pdf.getDestination(dest);
    return resolveDestPage(pdf, resolved);
  }

  if (Array.isArray(dest) && dest.length > 0) {
    try {
      const index = await pdf.getPageIndex(dest[0]);
      return index + 1;
    } catch {
      return null;
    }
  }

  return null;
}

async function flattenOutline(
  pdf: Awaited<ReturnType<typeof loadPdfDocument>>,
  items: Array<{ title: string; dest?: unknown; items?: unknown[] }> | null
): Promise<PdfBookmark[]> {
  if (!items?.length) return [];

  const results: PdfBookmark[] = [];
  for (const item of items) {
    const page = await resolveDestPage(pdf, item.dest);
    if (page) results.push({ title: item.title, page });
    if (item.items?.length) {
      const nested = await flattenOutline(
        pdf,
        item.items as Array<{ title: string; dest?: unknown; items?: unknown[] }>
      );
      results.push(...nested);
    }
  }
  return results;
}

export async function readPdfBookmarks(arrayBuffer: ArrayBuffer): Promise<PdfBookmark[]> {
  const pdf = await loadPdfDocument(arrayBuffer);
  try {
    const outline = await pdf.getOutline();
    return flattenOutline(pdf, outline);
  } finally {
    pdf.destroy();
  }
}

function addPageLink(
  doc: PDFDocument,
  page: ReturnType<PDFDocument["getPages"]>[number],
  targetPage: ReturnType<PDFDocument["getPages"]>[number],
  rect: [number, number, number, number]
) {
  const { context } = doc;
  const link = context.register(
    context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: rect,
      Border: [0, 0, 0],
      Dest: [targetPage.ref, "Fit"],
    })
  );

  const annots = page.node.lookup(PDFName.of("Annots"));
  if (annots instanceof PDFArray) {
    annots.push(link);
  } else {
    page.node.set(PDFName.of("Annots"), context.obj([link]));
  }
}

function setFlatOutline(doc: PDFDocument, entries: BookmarkEntry[]) {
  if (entries.length === 0) return;

  const pages = doc.getPages();
  const ctx = doc.context;
  const outlineRef = ctx.nextRef();
  const itemRefs = entries.map(() => ctx.nextRef());

  entries.forEach((entry, index) => {
    const page = pages[Math.min(Math.max(entry.page, 1), pages.length) - 1];
    const item = ctx.obj({
      Title: PDFString.of(entry.title),
      Parent: outlineRef,
      Dest: [page.ref, PDFName.of("Fit")],
      ...(index > 0 ? { Prev: itemRefs[index - 1] } : {}),
      ...(index < entries.length - 1 ? { Next: itemRefs[index + 1] } : {}),
    });
    ctx.assign(itemRefs[index], item);
  });

  const outline = ctx.obj({
    Type: "Outlines",
    First: itemRefs[0],
    Last: itemRefs[itemRefs.length - 1],
    Count: entries.length,
  });
  ctx.assign(outlineRef, outline);
  doc.catalog.set(PDFName.of("Outlines"), outlineRef);
  doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
}

export interface BookmarksTocOptions {
  entries: BookmarkEntry[];
  addTocPage?: boolean;
  addOutline?: boolean;
  tocTitle?: string;
}

export async function addBookmarksAndToc(
  arrayBuffer: ArrayBuffer,
  options: BookmarksTocOptions
): Promise<Uint8Array> {
  const { entries, addTocPage = true, addOutline = true, tocTitle = "Table of Contents" } = options;
  const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  if (addTocPage && entries.length > 0) {
    const tocPage = doc.insertPage(0, [pages[0].getWidth(), pages[0].getHeight()]);
    const { width, height } = tocPage.getSize();
    const margin = 48;
    let y = height - margin;

    tocPage.drawText(tocTitle, {
      x: margin,
      y: y - 20,
      size: 20,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 52;

    const lineHeight = 22;
    const allPages = doc.getPages();

    for (const entry of entries) {
      if (y < margin + lineHeight) break;
      const target = allPages[Math.min(Math.max(entry.page, 1), allPages.length - 1)];
      const indent = (entry.level ?? 0) * 14;
      const label = entry.title;
      const pageLabel = String(entry.page);
      const labelWidth = font.widthOfTextAtSize(label, 12);
      const pageWidth = font.widthOfTextAtSize(pageLabel, 12);

      tocPage.drawText(label, {
        x: margin + indent,
        y,
        size: 12,
        font,
        color: rgb(0.15, 0.35, 0.7),
      });
      tocPage.drawText(pageLabel, {
        x: width - margin - pageWidth,
        y,
        size: 12,
        font,
        color: rgb(0.35, 0.35, 0.35),
      });

      const linkY = y - 2;
      addPageLink(doc, tocPage, target, [
        margin + indent,
        linkY,
        width - margin,
        linkY + lineHeight,
      ]);

      y -= lineHeight;
    }
  }

  const outlineEntries = entries.map((entry) => ({
    ...entry,
    page: addTocPage ? entry.page + 1 : entry.page,
  }));

  if (addOutline) {
    setFlatOutline(doc, outlineEntries);
  }

  return doc.save();
}

export async function addAutoTocFromPages(
  arrayBuffer: ArrayBuffer,
  titles: string[]
): Promise<Uint8Array> {
  const entries = titles
    .map((title, index) => ({ title: title.trim(), page: index + 1 }))
    .filter((entry) => entry.title);
  return addBookmarksAndToc(arrayBuffer, { entries, addTocPage: true, addOutline: true });
}
