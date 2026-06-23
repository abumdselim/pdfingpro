import { PDFDocument } from "pdf-lib";

export interface SanitizeOptions {
  clearMetadata?: boolean;
  resetProducer?: boolean;
}

/** Strip metadata and rebuild PDF to remove scripts, attachments, and embedded extras. */
export async function sanitizePdf(
  buffer: ArrayBuffer,
  options: SanitizeOptions = {}
): Promise<Uint8Array> {
  const { clearMetadata = true, resetProducer = true } = options;
  const src = await PDFDocument.load(buffer, {
    ignoreEncryption: true,
    updateMetadata: false,
    throwOnInvalidObject: false,
  });
  const out = await PDFDocument.create();
  const indices = src.getPageIndices();
  const pages = await out.copyPages(src, indices);
  pages.forEach((page) => out.addPage(page));

  if (clearMetadata) {
    out.setTitle("");
    out.setAuthor("");
    out.setSubject("");
    out.setKeywords([]);
    out.setCreationDate(new Date(0));
    out.setModificationDate(new Date(0));
  }

  if (resetProducer) {
    out.setCreator("Pdfing Pro");
    out.setProducer("Pdfing Pro");
  }

  return out.save({ useObjectStreams: false });
}
