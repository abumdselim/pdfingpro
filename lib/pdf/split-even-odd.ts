import { PDFDocument } from "pdf-lib";
import { reorganizePages } from "./organize";

/** Split into two PDFs: even-indexed pages (2, 4, …) and odd-indexed pages (1, 3, …). */
export async function splitEvenOdd(buffer: ArrayBuffer): Promise<[Uint8Array, Uint8Array]> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const total = doc.getPageCount();

  const odd = Array.from({ length: total }, (_, i) => i).filter((i) => i % 2 === 0);
  const even = Array.from({ length: total }, (_, i) => i).filter((i) => i % 2 === 1);

  const [oddBytes, evenBytes] = await Promise.all([
    reorganizePages(buffer, odd),
    reorganizePages(buffer, even),
  ]);

  return [evenBytes, oddBytes];
}
