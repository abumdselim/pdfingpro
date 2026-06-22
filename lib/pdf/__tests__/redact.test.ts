import { describe, it, expect } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { applyRedactions, findTextMatches, matchesToRegions } from "@/lib/pdf/redact";
import { createTestPdf } from "./helpers";

async function createSearchablePdf(text: string, pageCount = 1): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([612, 792]);
    page.drawText(`${text} on page ${i + 1}`, { x: 72, y: 720, size: 18, font });
  }
  const bytes = await doc.save();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe("redact", () => {
  it("finds text matches across pages", async () => {
    const buffer = await createSearchablePdf("CONFIDENTIAL", 2);
    const matches = await findTextMatches(buffer, "CONFIDENTIAL");
    expect(matches.length).toBeGreaterThanOrEqual(2);
    expect(matches[0].text.toLowerCase()).toContain("confidential");
  });

  it("respects whole-word search option", async () => {
    const buffer = await createSearchablePdf("Page");
    const loose = await findTextMatches(buffer, "Pag");
    const strict = await findTextMatches(buffer, "Pag", { wholeWord: true });
    expect(loose.length).toBeGreaterThanOrEqual(1);
    expect(strict.length).toBe(0);
  });

  it("converts matches to regions and applies black rectangles", async () => {
    const buffer = await createTestPdf(1);
    const matches = await findTextMatches(buffer, "Page");
    expect(matches.length).toBeGreaterThan(0);

    const regions = matchesToRegions(matches);
    const out = await applyRedactions(buffer, regions);
    expect(out.length).toBeGreaterThan(0);

    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(1);
  });

  it("applies manual fractional regions", async () => {
    const buffer = await createTestPdf(1);
    const out = await applyRedactions(buffer, [
      { pageIndex: 0, xFrac: 0.1, yFrac: 0.1, wFrac: 0.3, hFrac: 0.05 },
    ]);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(1);
  });
});
