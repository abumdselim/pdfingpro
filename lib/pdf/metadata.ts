import { PDFDocument } from "pdf-lib";

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
}

function formatDate(date: Date | undefined): string {
  if (!date) return "";
  try {
    return date.toISOString();
  } catch {
    return "";
  }
}

/** Read document info dictionary fields from a PDF. */
export async function getPdfMetadata(buffer: ArrayBuffer): Promise<PdfMetadata> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  return {
    title: doc.getTitle() ?? "",
    author: doc.getAuthor() ?? "",
    subject: doc.getSubject() ?? "",
    keywords: doc.getKeywords() ?? "",
    creator: doc.getCreator() ?? "",
    producer: doc.getProducer() ?? "",
    creationDate: formatDate(doc.getCreationDate()),
    modificationDate: formatDate(doc.getModificationDate()),
  };
}

export interface MetadataUpdate {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
}

/** Update editable metadata fields and return a new PDF bytes. */
export async function setPdfMetadata(
  buffer: ArrayBuffer,
  update: MetadataUpdate
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true, updateMetadata: false });
  if (update.title !== undefined) doc.setTitle(update.title);
  if (update.author !== undefined) doc.setAuthor(update.author);
  if (update.subject !== undefined) doc.setSubject(update.subject);
  if (update.keywords !== undefined) {
    const kw = update.keywords.split(/[,;]/).map((k) => k.trim()).filter(Boolean);
    doc.setKeywords(kw);
  }
  return doc.save();
}
