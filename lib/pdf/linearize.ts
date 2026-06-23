import { PDFDocument } from "pdf-lib";

/** Re-save PDF with object streams disabled (web-friendly linearization hint). */
export async function linearizePdf(buffer: ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  return doc.save({ useObjectStreams: false });
}
