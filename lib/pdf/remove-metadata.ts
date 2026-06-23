import { PDFDocument } from "pdf-lib";

/** Clear document metadata fields and return a new PDF. */
export async function stripMetadata(buffer: ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true, updateMetadata: false });

  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setCreator("");
  doc.setProducer("Pdfing Pro");
  doc.setCreationDate(new Date(0));
  doc.setModificationDate(new Date(0));

  return doc.save();
}
