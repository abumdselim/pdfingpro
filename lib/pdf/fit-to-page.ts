import { PDFDocument } from "pdf-lib";
import { PAGE_SIZE_PT } from "./resize";

const MARGIN = 36;

/** Scale every page to fit A4 with uniform margins. */
export async function fitPdfToA4(buffer: ArrayBuffer, margin = MARGIN): Promise<Uint8Array> {
  const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const target = PAGE_SIZE_PT.a4;
  const innerW = target.width - margin * 2;
  const innerH = target.height - margin * 2;

  for (let i = 0; i < src.getPageCount(); i++) {
    const srcPage = src.getPage(i);
    const embedded = await out.embedPage(srcPage);
    const { width: sw, height: sh } = srcPage.getSize();
    const scale = Math.min(innerW / sw, innerH / sh);
    const drawW = sw * scale;
    const drawH = sh * scale;
    const x = margin + (innerW - drawW) / 2;
    const y = margin + (innerH - drawH) / 2;

    const page = out.addPage([target.width, target.height]);
    page.drawPage(embedded, { x, y, width: drawW, height: drawH });
  }

  return out.save();
}
