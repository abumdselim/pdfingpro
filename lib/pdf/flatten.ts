import { PDFDocument } from "pdf-lib";
import { rasterizePdfPages } from "./rasterize";

/** Flatten form fields and burn page content into a non-editable PDF. */
export async function flattenPdf(
  buffer: ArrayBuffer,
  onProgress?: (page: number, total: number) => void
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  try {
    doc.getForm().flatten();
  } catch {
    // No interactive form — rasterize still produces a flat output.
  }
  const intermediate = await doc.save();
  const arr = intermediate.buffer.slice(
    intermediate.byteOffset,
    intermediate.byteOffset + intermediate.byteLength
  ) as ArrayBuffer;
  return rasterizePdfPages(arr, 2, 0.92, onProgress);
}
