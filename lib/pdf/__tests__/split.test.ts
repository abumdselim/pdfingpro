import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { parseRangeString, splitPDF, splitPDFByPage } from "../split";
import { createTestPdf } from "./helpers";

describe("splitPDF", () => {
  it("splits a range into a PDF with the correct page count", async () => {
    const source = await createTestPdf(4);
    const [result] = await splitPDF(source, [{ from: 2, to: 3, label: "mid" }]);
    const doc = await PDFDocument.load(result.bytes);

    expect(result.label).toBe("mid");
    expect(doc.getPageCount()).toBe(2);
  });

  it("splits every page when using splitPDFByPage", async () => {
    const source = await createTestPdf(3);
    const results = await splitPDFByPage(source);

    expect(results).toHaveLength(3);
    for (const { bytes } of results) {
      const doc = await PDFDocument.load(bytes);
      expect(doc.getPageCount()).toBe(1);
    }
  });
});

describe("parseRangeString", () => {
  it("parses comma-separated ranges and single pages", () => {
    expect(parseRangeString("1-3, 5, 7-9", 10)).toEqual([
      { from: 1, to: 3, label: "pages-1-3" },
      { from: 5, to: 5, label: "page-5" },
      { from: 7, to: 9, label: "pages-7-9" },
    ]);
  });

  it("returns null for out-of-range input", () => {
    expect(parseRangeString("1-12", 10)).toBeNull();
    expect(parseRangeString("0", 10)).toBeNull();
    expect(parseRangeString("", 10)).toBeNull();
  });
});
