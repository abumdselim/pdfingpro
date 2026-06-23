import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type HeaderFooterSlot = "left" | "center" | "right";

export interface HeaderFooterOptions {
  header?: Partial<Record<HeaderFooterSlot, string>>;
  footer?: Partial<Record<HeaderFooterSlot, string>>;
  fontSize?: number;
  margin?: number;
  color?: { r: number; g: number; b: number };
  includePageNumber?: boolean;
  pageNumberFormat?: string;
  startAt?: number;
}

function slotX(
  slot: HeaderFooterSlot,
  width: number,
  textWidth: number,
  margin: number
): number {
  switch (slot) {
    case "left":
      return margin;
    case "center":
      return (width - textWidth) / 2;
    case "right":
      return width - textWidth - margin;
  }
}

function renderLine(
  page: ReturnType<PDFDocument["getPages"]>[number],
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  y: number,
  slots: Partial<Record<HeaderFooterSlot, string>>,
  opts: Required<Pick<HeaderFooterOptions, "fontSize" | "margin" | "color">>
) {
  const { width } = page.getSize();
  (["left", "center", "right"] as const).forEach((slot) => {
    const text = slots[slot]?.trim();
    if (!text) return;
    const textWidth = font.widthOfTextAtSize(text, opts.fontSize);
    page.drawText(text, {
      x: slotX(slot, width, textWidth, opts.margin),
      y,
      size: opts.fontSize,
      font,
      color: rgb(opts.color.r, opts.color.g, opts.color.b),
    });
  });
}

export async function addHeaderFooter(
  arrayBuffer: ArrayBuffer,
  options: HeaderFooterOptions = {}
): Promise<Uint8Array> {
  const {
    header = {},
    footer = {},
    fontSize = 10,
    margin = 28,
    color = { r: 0.25, g: 0.25, b: 0.25 },
    includePageNumber = false,
    pageNumberFormat = "{n}",
    startAt = 1,
  } = options;

  const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;
  const drawOpts = { fontSize, margin, color };

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const pageNum = index + startAt;

    const headerSlots = { ...header };
    const footerSlots = { ...footer };

    if (includePageNumber) {
      const label = pageNumberFormat
        .replace("{n}", String(pageNum))
        .replace("{total}", String(total));
      if (!footerSlots.center && !footerSlots.right) {
        footerSlots.center = label;
      } else if (!footerSlots.right) {
        footerSlots.right = label;
      } else {
        footerSlots.right = `${footerSlots.right} · ${label}`;
      }
    }

    if (Object.values(headerSlots).some(Boolean)) {
      renderLine(page, font, height - margin - fontSize, headerSlots, drawOpts);
    }
    if (Object.values(footerSlots).some(Boolean)) {
      renderLine(page, font, margin, footerSlots, drawOpts);
    }
  });

  return doc.save();
}
