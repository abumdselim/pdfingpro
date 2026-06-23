import { PDFDocument } from "pdf-lib";
import { reorganizePages } from "./organize";

/** Insert a copy of each selected page immediately after the original (0-indexed). */
export async function duplicatePages(
  buffer: ArrayBuffer,
  pageIndices: number[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const total = doc.getPageCount();
  const dupSet = new Set(pageIndices.filter((i) => i >= 0 && i < total));
  const order: number[] = [];

  for (let i = 0; i < total; i++) {
    order.push(i);
    if (dupSet.has(i)) order.push(i);
  }

  return reorganizePages(buffer, order);
}
