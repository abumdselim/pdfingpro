import { describe, it, expect } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { duplicatePages } from "@/lib/pdf/duplicate-pages";
import { extractPagesToPdf } from "@/lib/pdf/extract-pages";
import { resizePdfToPreset } from "@/lib/pdf/resize";
import { removeBlankPages } from "@/lib/pdf/blank-pages";
import { addImageToPdf } from "@/lib/pdf/add-image";
import { createTestPdf } from "./helpers";

/** 1×1 red PNG */
const TINY_PNG = Uint8Array.from(
  atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="),
  (c) => c.charCodeAt(0)
);

async function createPdfWithBlankMiddle(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  doc.addPage([612, 792]).drawText("Page 1", { x: 72, y: 720, size: 18, font });
  doc.addPage([612, 792]); // blank
  doc.addPage([612, 792]).drawText("Page 3", { x: 72, y: 720, size: 18, font });
  const bytes = await doc.save();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe("phase 2 pdf tools", () => {
  it("duplicates selected pages", async () => {
    const buffer = await createTestPdf(2);
    const out = await duplicatePages(buffer, [0]);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(3);
  });

  it("extracts selected pages into one pdf", async () => {
    const buffer = await createTestPdf(3);
    const out = await extractPagesToPdf(buffer, [0, 2]);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });

  it("resizes pages to A4", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([400, 400]);
    const bytes = await doc.save();
    const arr = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const out = await resizePdfToPreset(arr, "a4", "fit");
    const resized = await PDFDocument.load(out);
    const page = resized.getPage(0);
    const { width, height } = page.getSize();
    expect(Math.round(width)).toBe(595);
    expect(Math.round(height)).toBe(842);
  });

  it("removes blank pages from a mixed document", async () => {
    const buffer = await createPdfWithBlankMiddle();
    const { bytes, removed } = await removeBlankPages(buffer);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(2);
    expect(removed).toBe(1);
  });

  it("adds an image to a pdf page", async () => {
    const buffer = await createTestPdf(1);
    const pngBuffer = TINY_PNG.buffer.slice(TINY_PNG.byteOffset, TINY_PNG.byteOffset + TINY_PNG.byteLength) as ArrayBuffer;
    const out = await addImageToPdf(buffer, pngBuffer, "image/png", { pageIndex: 0 });
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(1);
    expect(out.byteLength).toBeGreaterThan(buffer.byteLength);
  });
});
