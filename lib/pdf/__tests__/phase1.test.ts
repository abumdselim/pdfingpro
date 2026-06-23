import { describe, it, expect } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { extractTextFromPdf } from "@/lib/pdf/extract-text";
import { reversePdfPages } from "@/lib/pdf/reverse";
import { getPdfInfo } from "@/lib/pdf/info";
import { createTestPdf } from "./helpers";

async function createLabeledPdf(pages: string[]): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const label of pages) {
    const page = doc.addPage([612, 792]);
    page.drawText(label, { x: 72, y: 720, size: 18, font });
  }
  const bytes = await doc.save();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe("phase 1 pdf tools", () => {
  it("extracts text by page", async () => {
    const buffer = await createTestPdf(2);
    const text = await extractTextFromPdf(buffer);
    expect(text).toContain("Page 1");
    expect(text).toContain("Page 2");
    expect(text).toContain("--- Page 1 ---");
  });

  it("reverses page order", async () => {
    const buffer = await createLabeledPdf(["FIRST", "SECOND"]);
    const out = await reversePdfPages(buffer);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });

  it("reads pdf info", async () => {
    const buffer = await createTestPdf(3);
    const info = await getPdfInfo(buffer);
    expect(info.pageCount).toBe(3);
    expect(info.encrypted).toBe(false);
    expect(info.fileSizeBytes).toBeGreaterThan(0);
  });
});
