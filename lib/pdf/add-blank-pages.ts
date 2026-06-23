import { PDFDocument } from "pdf-lib";

export type BlankPagePosition = number | "start" | "end";

/** Insert blank pages at `position` (1-based index, or `"start"` / `"end"`). */
export async function addBlankPages(
  buffer: ArrayBuffer,
  count: number,
  position: BlankPagePosition = "end"
): Promise<Uint8Array> {
  if (count < 1) throw new Error("Count must be at least 1.");

  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pages = doc.getPages();
  if (pages.length === 0) throw new Error("PDF has no pages.");

  const { width, height } = pages[0].getSize();
  let insertAt: number;

  if (position === "start") {
    insertAt = 0;
  } else if (position === "end") {
    insertAt = pages.length;
  } else {
    insertAt = Math.min(Math.max(0, position - 1), pages.length);
  }

  for (let i = 0; i < count; i++) {
    doc.insertPage(insertAt + i, [width, height]);
  }

  return doc.save();
}
