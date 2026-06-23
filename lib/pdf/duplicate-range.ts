import { PDFDocument } from "pdf-lib";
import { reorganizePages } from "./organize";

/** Duplicate pages `from`–`to` (1-based) and insert `times` copies after the range. */
export async function duplicatePageRange(
  buffer: ArrayBuffer,
  from: number,
  to: number,
  times = 1
): Promise<Uint8Array> {
  if (times < 1) throw new Error("Times must be at least 1.");

  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const total = doc.getPageCount();
  const start = Math.max(0, from - 1);
  const end = Math.min(total - 1, to - 1);
  if (start > end) throw new Error("Invalid page range.");

  const rangeIndices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const order: number[] = [];

  for (let i = 0; i < total; i++) {
    order.push(i);
    if (i === end) {
      for (let t = 0; t < times; t++) {
        order.push(...rangeIndices);
      }
    }
  }

  return reorganizePages(buffer, order);
}
