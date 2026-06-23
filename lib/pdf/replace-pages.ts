import { PDFDocument } from "pdf-lib";

/** Replace pages `from`–`to` (1-based) in `base` with all pages from `replacement`. */
export async function replacePageRange(
  base: ArrayBuffer,
  replacement: ArrayBuffer,
  from: number,
  to: number
): Promise<Uint8Array> {
  const [baseDoc, replDoc] = await Promise.all([
    PDFDocument.load(base, { ignoreEncryption: true }),
    PDFDocument.load(replacement, { ignoreEncryption: true }),
  ]);

  const baseCount = baseDoc.getPageCount();
  const start = Math.max(1, from);
  const end = Math.min(baseCount, to);
  if (start > end) throw new Error("Invalid page range.");

  const out = await PDFDocument.create();
  const beforeEnd = start - 2;

  if (beforeEnd >= 0) {
    const before = await out.copyPages(
      baseDoc,
      Array.from({ length: beforeEnd + 1 }, (_, i) => i)
    );
    before.forEach((page) => out.addPage(page));
  }

  const inserted = await out.copyPages(
    replDoc,
    Array.from({ length: replDoc.getPageCount() }, (_, i) => i)
  );
  inserted.forEach((page) => out.addPage(page));

  const afterStart = end;
  if (afterStart < baseCount) {
    const after = await out.copyPages(
      baseDoc,
      Array.from({ length: baseCount - afterStart }, (_, i) => afterStart + i)
    );
    after.forEach((page) => out.addPage(page));
  }

  return out.save();
}
