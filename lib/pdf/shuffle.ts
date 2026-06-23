import { PDFDocument } from "pdf-lib";
import { reorganizePages } from "./organize";

function fisherYates(order: number[]): number[] {
  const arr = [...order];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Randomly reorder all pages using Fisher–Yates shuffle. */
export async function shufflePdfPages(buffer: ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const count = doc.getPageCount();
  const order = fisherYates(Array.from({ length: count }, (_, i) => i));
  return reorganizePages(buffer, order);
}
