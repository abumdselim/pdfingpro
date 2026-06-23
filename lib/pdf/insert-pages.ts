import { PDFDocument } from "pdf-lib";

/** Insert pages from `insertBuffer` into `baseBuffer` at a 1-based position. */
export async function insertPages(
  baseBuffer: ArrayBuffer,
  insertBuffer: ArrayBuffer,
  position: number
): Promise<Uint8Array> {
  const [base, insert] = await Promise.all([
    PDFDocument.load(baseBuffer, { ignoreEncryption: true }),
    PDFDocument.load(insertBuffer, { ignoreEncryption: true }),
  ]);

  const out = await PDFDocument.create();
  const baseCount = base.getPageCount();
  const at = Math.min(Math.max(0, position - 1), baseCount);

  if (at > 0) {
    const before = await out.copyPages(base, Array.from({ length: at }, (_, i) => i));
    before.forEach((page) => out.addPage(page));
  }

  const inserted = await out.copyPages(
    insert,
    Array.from({ length: insert.getPageCount() }, (_, i) => i)
  );
  inserted.forEach((page) => out.addPage(page));

  if (at < baseCount) {
    const after = await out.copyPages(
      base,
      Array.from({ length: baseCount - at }, (_, i) => at + i)
    );
    after.forEach((page) => out.addPage(page));
  }

  return out.save();
}
