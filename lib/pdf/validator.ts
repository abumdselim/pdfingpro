import { PDFDocument } from "pdf-lib";

export interface ValidatePdfResult {
  valid: boolean;
  pages: number;
  encrypted: boolean;
  error?: string;
}

/** Check whether a buffer is a loadable PDF and report basic properties. */
export async function validatePdf(buffer: ArrayBuffer): Promise<ValidatePdfResult> {
  try {
    const doc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });
    return {
      valid: true,
      pages: doc.getPageCount(),
      encrypted: doc.isEncrypted,
    };
  } catch (err) {
    return {
      valid: false,
      pages: 0,
      encrypted: false,
      error: err instanceof Error ? err.message : "Invalid or corrupted PDF.",
    };
  }
}
