import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFString,
  StandardFonts,
  rgb,
} from "pdf-lib";

export interface PdfLinkEntry {
  page: number;
  url: string;
  label: string;
}

export function parseLinkLines(input: string, pageCount: number): PdfLinkEntry[] | null {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const entries: PdfLinkEntry[] = [];
  for (const line of lines) {
    const parts = line.split("|").map((part) => part.trim());
    if (parts.length < 2) return null;

    const page = Number(parts[0]);
    const url = parts[1];
    const label = parts[2] || url;

    if (!Number.isInteger(page) || page < 1 || page > pageCount) return null;
    if (!/^https?:\/\//i.test(url)) return null;

    entries.push({ page, url, label });
  }

  return entries;
}

function addUriLink(
  doc: PDFDocument,
  page: ReturnType<PDFDocument["getPages"]>[number],
  rect: [number, number, number, number],
  url: string
) {
  const { context } = doc;
  const link = context.register(
    context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: rect,
      Border: [0, 0, 0],
      A: {
        Type: "Action",
        S: "URI",
        URI: PDFString.of(url),
      },
    })
  );

  const annots = page.node.lookup(PDFName.of("Annots"));
  if (annots instanceof PDFArray) {
    annots.push(link);
  } else {
    page.node.set(PDFName.of("Annots"), context.obj([link]));
  }
}

export interface AddLinksOptions {
  entries: PdfLinkEntry[];
  fontSize?: number;
  margin?: number;
}

export async function addLinksToPDF(
  arrayBuffer: ArrayBuffer,
  options: AddLinksOptions
): Promise<Uint8Array> {
  const { entries, fontSize = 11, margin = 48 } = options;
  const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  const byPage = new Map<number, PdfLinkEntry[]>();
  for (const entry of entries) {
    const list = byPage.get(entry.page) ?? [];
    list.push(entry);
    byPage.set(entry.page, list);
  }

  for (const [pageNumber, pageLinks] of byPage) {
    const page = pages[pageNumber - 1];
    if (!page) continue;

    const { width } = page.getSize();
    let y = margin + fontSize;

    for (const link of pageLinks) {
      const textWidth = font.widthOfTextAtSize(link.label, fontSize);
      const x = margin;
      const rect: [number, number, number, number] = [
        x,
        y - 2,
        x + textWidth + 4,
        y + fontSize + 2,
      ];

      page.drawText(link.label, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.08, 0.35, 0.75),
      });
      addUriLink(doc, page, rect, link.url);
      y += fontSize + 8;
    }
  }

  return doc.save();
}
