import { PDFDocument } from "pdf-lib";

/** Split a PDF into parts with up to `n` pages each. */
export async function splitEveryNPages(
  buffer: ArrayBuffer,
  n: number
): Promise<Uint8Array[]> {
  if (n < 1) throw new Error("N must be at least 1.");

  const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const total = src.getPageCount();
  const results: Uint8Array[] = [];

  for (let start = 0; start < total; start += n) {
    const end = Math.min(start + n, total);
    const doc = await PDFDocument.create();
    const indices = Array.from({ length: end - start }, (_, i) => start + i);
    const pages = await doc.copyPages(src, indices);
    pages.forEach((page) => doc.addPage(page));
    results.push(await doc.save());
  }

  return results;
}
