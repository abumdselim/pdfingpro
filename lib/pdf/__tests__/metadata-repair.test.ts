import { describe, it, expect } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { getPdfMetadata, setPdfMetadata } from "@/lib/pdf/metadata";
import { repairPDF } from "@/lib/pdf/repair";
import { createTestPdf } from "./helpers";

describe("metadata", () => {
  it("reads and updates document metadata", async () => {
    const buffer = await createTestPdf(1);
    const doc = await PDFDocument.load(buffer);
    doc.setTitle("Test Title");
    doc.setAuthor("Test Author");
    const saved = await doc.save();
    const arr = saved.buffer.slice(saved.byteOffset, saved.byteOffset + saved.byteLength) as ArrayBuffer;

    const meta = await getPdfMetadata(arr);
    expect(meta.title).toBe("Test Title");
    expect(meta.author).toBe("Test Author");

    const updated = await setPdfMetadata(arr, { subject: "A subject", keywords: "one, two" });
    const after = await getPdfMetadata(
      updated.buffer.slice(updated.byteOffset, updated.byteOffset + updated.byteLength) as ArrayBuffer
    );
    expect(after.subject).toBe("A subject");
    expect(after.keywords).toContain("one");
    expect(after.keywords).toContain("two");
  });
});

describe("repair", () => {
  it("re-saves a valid PDF successfully", async () => {
    const buffer = await createTestPdf(2);
    const result = await repairPDF(buffer);
    expect(result.pageCount).toBe(2);
    expect(result.bytes.length).toBeGreaterThan(0);

    const doc = await PDFDocument.load(result.bytes);
    expect(doc.getPageCount()).toBe(2);
  });
});
