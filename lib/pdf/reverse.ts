import { PDFDocument } from "pdf-lib";
import { reorganizePages } from "./organize";

/** Reverse the page order of a PDF. */
export async function reversePdfPages(buffer: ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const count = doc.getPageCount();
  const order = Array.from({ length: count }, (_, i) => count - 1 - i);
  return reorganizePages(buffer, order);
}
