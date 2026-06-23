import { PDFDocument } from "pdf-lib";
import { loadPdfDocument } from "./core";

export interface PdfAttachment {
  id: string;
  filename: string;
  bytes: Uint8Array;
  mimeType?: string;
}

interface PdfJsAttachment {
  filename?: string;
  content: Uint8Array;
  contentType?: string;
}

/** Extract embedded file attachments from a PDF. */
export async function extractAttachments(buffer: ArrayBuffer): Promise<PdfAttachment[]> {
  const pdf = await loadPdfDocument(buffer);

  try {
    const raw = (await pdf.getAttachments()) as Record<string, PdfJsAttachment> | null;
    if (!raw) return [];

    return Object.entries(raw).map(([id, item]) => ({
      id,
      filename: item.filename || id,
      bytes: item.content,
      mimeType: item.contentType,
    }));
  } finally {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  }
}

export interface AttachmentInput {
  filename: string;
  bytes: Uint8Array;
  mimeType?: string;
  description?: string;
}

/** Embed one or more file attachments into a PDF. */
export async function addAttachmentsToPdf(
  buffer: ArrayBuffer,
  attachments: AttachmentInput[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  for (const file of attachments) {
    await doc.attach(file.bytes, file.filename, {
      mimeType: file.mimeType || "application/octet-stream",
      description: file.description || file.filename,
    });
  }

  return doc.save();
}
