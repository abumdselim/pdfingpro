import { PDFDocument } from "pdf-lib";

export interface RepairResult {
  bytes: Uint8Array;
  pageCount: number;
  message: string;
}

/**
 * Attempt to repair a corrupted PDF by reloading and re-saving with pdf-lib.
 * This fixes some structural issues but cannot recover severely damaged files.
 */
export async function repairPDF(buffer: ArrayBuffer): Promise<RepairResult> {
  try {
    const doc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
      updateMetadata: false,
    });
    const pageCount = doc.getPageCount();
    const bytes = await doc.save({ useObjectStreams: false });
    return {
      bytes,
      pageCount,
      message: `Repaired PDF with ${pageCount} page${pageCount === 1 ? "" : "s"}.`,
    };
  } catch {
    throw new Error("Could not repair this PDF. The file may be severely corrupted or not a valid PDF.");
  }
}
