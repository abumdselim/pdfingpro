import { describe, it, expect } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { nUpPdf, getNUpGrid } from "@/lib/pdf/n-up";
import { createBookletPdf, getBookletImpositionOrder, padBookletPageCount } from "@/lib/pdf/booklet";
import { sanitizePdf } from "@/lib/pdf/sanitize";
import { compressPdfImages, operatorListHasImages } from "@/lib/pdf/compress-images";
import { getPdfMetadata } from "@/lib/pdf/metadata";
import { createTestPdf } from "./helpers";

describe("phase 3 pdf tools", () => {
  it("returns n-up grid dimensions", () => {
    expect(getNUpGrid(2)).toEqual({ cols: 1, rows: 2 });
    expect(getNUpGrid(4)).toEqual({ cols: 2, rows: 2 });
    expect(getNUpGrid(9)).toEqual({ cols: 3, rows: 3 });
  });

  it("creates 4-up sheets from eight pages", async () => {
    const buffer = await createTestPdf(8);
    const out = await nUpPdf(buffer, 4, "a4");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });

  it("builds saddle-stitch booklet order", () => {
    expect(padBookletPageCount(6)).toBe(8);
    expect(getBookletImpositionOrder(8)).toEqual([7, 0, 1, 6, 5, 2, 3, 4]);
  });

  it("creates booklet pdf with paired pages", async () => {
    const buffer = await createTestPdf(8);
    const out = await createBookletPdf(buffer, "a4");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(4);
  });

  it("sanitizes metadata from pdf", async () => {
    const doc = await PDFDocument.create();
    doc.setTitle("Secret");
    doc.setAuthor("Someone");
    doc.addPage();
    const bytes = await doc.save();
    const arr = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

    const out = await sanitizePdf(arr);
    const meta = await getPdfMetadata(out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer);
    expect(meta.title).toBe("");
    expect(meta.author).toBe("");
    expect(meta.creator).toBe("Pdfing Pro");
  });

  it("detects image paint operators", () => {
    expect(operatorListHasImages([84, 85, 12])).toBe(true);
    expect(operatorListHasImages([84, 12])).toBe(false);
  });

  it("compresses pdf images fallback keeps page count", async () => {
    const buffer = await createTestPdf(2);
    const out = await compressPdfImages(buffer, "medium");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });
});
