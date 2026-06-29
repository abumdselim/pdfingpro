import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { addHeaderFooter } from "@/lib/pdf/header-footer";

describe("addHeaderFooter", () => {
  it("returns a valid PDF with the same page count", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([400, 500]);
    doc.addPage([400, 500]);
    const input = await doc.save();
    const buffer = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);

    const output = await addHeaderFooter(buffer, {
      header: { center: "Header Title" },
      footer: { left: "Confidential" },
      includePageNumber: true,
      pageNumberFormat: "{n}",
    });

    const saved = await PDFDocument.load(output);
    expect(saved.getPageCount()).toBe(2);
    expect(output.byteLength).toBeGreaterThan(0);
  });
});
