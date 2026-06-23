import { PDFDocument } from "pdf-lib";
import { getPdfMetadata, type PdfMetadata } from "./metadata";

export interface PdfInfo extends PdfMetadata {
  pageCount: number;
  encrypted: boolean;
  fileSizeBytes: number;
}

/** Read document properties for the info viewer. */
export async function getPdfInfo(buffer: ArrayBuffer, fileSizeBytes = buffer.byteLength): Promise<PdfInfo> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const meta = await getPdfMetadata(buffer);
  return {
    ...meta,
    pageCount: doc.getPageCount(),
    encrypted: doc.isEncrypted,
    fileSizeBytes,
  };
}
