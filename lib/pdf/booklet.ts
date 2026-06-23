import { PDFDocument, PDFPage } from "pdf-lib";
import { PAGE_SIZE_PT, type PageSizePreset } from "./resize";

/** Pad page count up to a multiple of four for saddle-stitch booklets. */
export function padBookletPageCount(pageCount: number): number {
  return Math.max(4, Math.ceil(pageCount / 4) * 4);
}

/**
 * Saddle-stitch booklet imposition order (0-indexed).
 * Blank slots beyond the original page count are represented as -1.
 */
export function getBookletImpositionOrder(pageCount: number): number[] {
  const total = padBookletPageCount(pageCount);
  const order: number[] = [];
  const sheets = total / 4;

  for (let s = 0; s < sheets; s++) {
    const leftFront = total - 2 * s - 1;
    const rightFront = 2 * s;
    const leftBack = 2 * s + 1;
    const rightBack = total - 2 * s - 2;
    order.push(leftFront, rightFront, leftBack, rightBack);
  }

  return order.map((idx) => (idx < pageCount ? idx : -1));
}

function drawPageSlot(
  target: PDFPage,
  embedded: Awaited<ReturnType<PDFDocument["embedPage"]>>,
  sw: number,
  sh: number,
  slotX: number,
  slotY: number,
  slotW: number,
  slotH: number
) {
  const scale = Math.min(slotW / sw, slotH / sh);
  const drawW = sw * scale;
  const drawH = sh * scale;
  const x = slotX + (slotW - drawW) / 2;
  const y = slotY + (slotH - drawH) / 2;
  target.drawPage(embedded, { x, y, width: drawW, height: drawH });
}

/** Create a saddle-stitch booklet PDF with two source pages per sheet side. */
export async function createBookletPdf(
  buffer: ArrayBuffer,
  preset: PageSizePreset = "a4"
): Promise<Uint8Array> {
  const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const sheet = PAGE_SIZE_PT[preset];
  const order = getBookletImpositionOrder(src.getPageCount());

  for (let i = 0; i < order.length; i += 2) {
    const page = out.addPage([sheet.width, sheet.height]);
    const leftIdx = order[i];
    const rightIdx = order[i + 1];
    const slotW = sheet.width / 2;

    if (leftIdx >= 0) {
      const srcPage = src.getPage(leftIdx);
      const embedded = await out.embedPage(srcPage);
      const { width: sw, height: sh } = srcPage.getSize();
      drawPageSlot(page, embedded, sw, sh, 0, 0, slotW, sheet.height);
    }

    if (rightIdx >= 0) {
      const srcPage = src.getPage(rightIdx);
      const embedded = await out.embedPage(srcPage);
      const { width: sw, height: sh } = srcPage.getSize();
      drawPageSlot(page, embedded, sw, sh, slotW, 0, slotW, sheet.height);
    }
  }

  return out.save();
}
