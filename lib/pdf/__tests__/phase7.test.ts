import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatBatesNumber, addBatesNumbers } from "@/lib/pdf/bates";
import { pdfToHtml } from "@/lib/pdf/pdf-to-html";

describe("formatBatesNumber", () => {
  it("pads numbers with leading zeros", () => {
    expect(formatBatesNumber("ACME-", 42, 6)).toBe("ACME-000042");
  });
});

describe("addBatesNumbers", () => {
  it("returns a valid PDF with the same page count", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    doc.addPage([400, 500]);
    doc.addPage([400, 500]);
    doc.getPage(0).drawText("A", { x: 50, y: 400, size: 12, font, color: rgb(0, 0, 0) });
    const input = await doc.save();
    // Copy into a fresh ArrayBuffer so the type narrows from
    // `ArrayBufferLike` (ArrayBuffer | SharedArrayBuffer) to ArrayBuffer.
    const buffer = new ArrayBuffer(input.byteLength);
    new Uint8Array(buffer).set(input);

    const output = await addBatesNumbers(buffer, { prefix: "DOC-", digits: 5, startAt: 10 });
    const saved = await PDFDocument.load(output);
    expect(saved.getPageCount()).toBe(2);
  });
});

describe("pdfToHtml", () => {
  it("returns HTML containing page sections", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([400, 500]);
    page.drawText("Hello HTML", { x: 50, y: 400, size: 12, font, color: rgb(0, 0, 0) });
    const bytes = await doc.save();
    // Copy into a fresh ArrayBuffer so the type narrows from
    // `ArrayBufferLike` (ArrayBuffer | SharedArrayBuffer) to ArrayBuffer.
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);

    const html = await pdfToHtml(buffer);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('data-page="1"');
    expect(html).toContain("Hello HTML");
  });
});
