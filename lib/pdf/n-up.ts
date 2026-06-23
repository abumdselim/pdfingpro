import { PDFDocument } from "pdf-lib";
import { PAGE_SIZE_PT, type PageSizePreset } from "./resize";

export type NUpCount = 2 | 4 | 9;

export function getNUpGrid(count: NUpCount): { cols: number; rows: number } {
  if (count === 2) return { cols: 1, rows: 2 };
  if (count === 4) return { cols: 2, rows: 2 };
  return { cols: 3, rows: 3 };
}

/** Arrange PDF pages in an N-up grid (2, 4, or 9 per sheet). */
export async function nUpPdf(
  buffer: ArrayBuffer,
  count: NUpCount,
  preset: PageSizePreset = "a4"
): Promise<Uint8Array> {
  const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const { cols, rows } = getNUpGrid(count);
  const sheet = PAGE_SIZE_PT[preset];
  const cellW = sheet.width / cols;
  const cellH = sheet.height / rows;
  const total = src.getPageCount();

  for (let i = 0; i < total; i += count) {
    const page = out.addPage([sheet.width, sheet.height]);

    for (let slot = 0; slot < count; slot++) {
      const srcIndex = i + slot;
      if (srcIndex >= total) break;

      const srcPage = src.getPage(srcIndex);
      const embedded = await out.embedPage(srcPage);
      const { width: sw, height: sh } = srcPage.getSize();
      const scale = Math.min(cellW / sw, cellH / sh);
      const drawW = sw * scale;
      const drawH = sh * scale;

      const col = slot % cols;
      const row = Math.floor(slot / cols);
      const x = col * cellW + (cellW - drawW) / 2;
      const y = sheet.height - (row + 1) * cellH + (cellH - drawH) / 2;

      page.drawPage(embedded, { x, y, width: drawW, height: drawH });
    }
  }

  return out.save();
}
