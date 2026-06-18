import { describe, expect, it } from "vitest";
import { reorganizePages, deletePages } from "../organize";
import { createTestPdf } from "./helpers";

describe("reorganizePages", () => {
  it("reorders pages according to index list", async () => {
    const src = await createTestPdf(4);
    const out = await reorganizePages(src, [2, 0, 3]);
    const doc = await import("pdf-lib").then(({ PDFDocument }) => PDFDocument.load(out));
    expect(doc.getPageCount()).toBe(3);
  });

  it("deletePages removes specified indices", async () => {
    const src = await createTestPdf(5);
    const out = await deletePages(src, [1, 3]);
    const doc = await import("pdf-lib").then(({ PDFDocument }) => PDFDocument.load(out));
    expect(doc.getPageCount()).toBe(3);
  });
});
