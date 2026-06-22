import { PDFDocument } from "pdf-lib";

export interface PdfaResult {
  bytes: Uint8Array;
  level: "none" | "best-effort";
  warnings: string[];
}

/**
 * Best-effort PDF normalization. True ISO 19005 PDF/A compliance requires
 * specialized server-side tooling (font embedding audits, color profiles, etc.).
 * This re-saves the document with linearization disabled and documents limitations.
 */
export async function convertToPdfA(buffer: ArrayBuffer): Promise<PdfaResult> {
  const warnings = [
    "Full PDF/A (ISO 19005) compliance cannot be guaranteed in the browser.",
    "Embedded fonts, ICC color profiles, and XMP metadata requirements are not fully validated.",
    "For archival compliance, use a dedicated PDF/A validator after download.",
  ];

  try {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    doc.setProducer("Pdfing Pro (browser normalization)");
    const bytes = await doc.save({ useObjectStreams: false });
    return { bytes, level: "best-effort", warnings };
  } catch {
    throw new Error("Could not process this PDF for PDF/A normalization.");
  }
}
