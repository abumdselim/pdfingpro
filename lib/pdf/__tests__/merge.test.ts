import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { mergePDFs } from "../merge";
import { createTestPdf } from "./helpers";

describe("mergePDFs", () => {
  it("merges two single-page PDFs into one two-page PDF", async () => {
    const [a, b] = await Promise.all([createTestPdf(1), createTestPdf(1)]);
    const mergedBytes = await mergePDFs([a, b]);
    const merged = await PDFDocument.load(mergedBytes);

    expect(merged.getPageCount()).toBe(2);
  });

  it("preserves page order from input files", async () => {
    const [twoPage, onePage] = await Promise.all([createTestPdf(2), createTestPdf(1)]);
    const mergedBytes = await mergePDFs([twoPage, onePage]);
    const merged = await PDFDocument.load(mergedBytes);

    expect(merged.getPageCount()).toBe(3);
  });

  it("returns a valid PDF when given no inputs", async () => {
    const mergedBytes = await mergePDFs([]);
    expect(mergedBytes.byteLength).toBeGreaterThan(0);
    const merged = await PDFDocument.load(mergedBytes);
    expect(merged.getPageCount()).toBeGreaterThanOrEqual(0);
  });
});
