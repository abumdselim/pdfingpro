import { PDFDocument } from "pdf-lib";
import { reorganizePages } from "./organize";

/** Reorder pages from smallest to largest area (width × height). */
export async function sortPagesBySize(buffer: ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const indices = Array.from({ length: doc.getPageCount() }, (_, i) => i);

  indices.sort((a, b) => {
    const pa = doc.getPage(a).getSize();
    const pb = doc.getPage(b).getSize();
    return pa.width * pa.height - pb.width * pb.height;
  });

  return reorganizePages(buffer, indices);
}
