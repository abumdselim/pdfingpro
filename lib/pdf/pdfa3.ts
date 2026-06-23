import { PDFDocument } from "pdf-lib";

export interface Pdfa3Result {
  bytes: Uint8Array;
  level: "none" | "best-effort";
  warnings: string[];
}

/**
 * Best-effort PDF/A-3 normalization. True ISO 19005-3 compliance requires
 * specialized server-side tooling; this re-saves with A-3 metadata hints.
 */
export async function convertToPdfA3(buffer: ArrayBuffer): Promise<Pdfa3Result> {
  const warnings = [
    "Full PDF/A-3 (ISO 19005-3) compliance cannot be guaranteed in the browser.",
    "Embedded files, font embedding audits, and XMP requirements are not fully validated.",
    "For archival compliance, use a dedicated PDF/A-3 validator after download.",
  ];

  try {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    doc.setProducer("Pdfing Pro (PDF/A-3 browser normalization)");
    doc.setSubject("PDF/A-3 best-effort export");
    const bytes = await doc.save({ useObjectStreams: false });
    return { bytes, level: "best-effort", warnings };
  } catch {
    throw new Error("Could not process this PDF for PDF/A-3 normalization.");
  }
}
