import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { parseLinkLines, addLinksToPDF } from "@/lib/pdf/add-links";
import { parseSizeLimit, splitPDFBySize } from "@/lib/pdf/split-by-size";
import { countAutoRotatedPages, autoRotatePDF } from "@/lib/pdf/auto-rotate";
import { mergeAlternatePages } from "@/lib/pdf/merge-alternate";
import { textToPDF } from "@/lib/pdf/text-to-pdf";

async function toBuffer(bytes: Uint8Array): Promise<ArrayBuffer> {
  // Copy into a fresh ArrayBuffer so the return type narrows from
  // `ArrayBufferLike` (ArrayBuffer | SharedArrayBuffer) to ArrayBuffer.
  const out = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(out).set(bytes);
  return out;
}

async function makeLabeledPdf(label: string, pages = 1, filler = ""): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([400, 500]);
    page.drawText(`${label} page ${i + 1}`, { x: 50, y: 450, size: 14, font, color: rgb(0, 0, 0) });
    if (filler) {
      page.drawText(filler, { x: 50, y: 400, size: 8, font, color: rgb(0.2, 0.2, 0.2), maxWidth: 300, lineHeight: 10 });
    }
  }
  return toBuffer(await doc.save());
}

describe("parseSizeLimit", () => {
  it("converts MB to bytes", () => {
    expect(parseSizeLimit("5", "MB")).toBe(5 * 1024 * 1024);
  });

  it("rejects invalid values", () => {
    expect(parseSizeLimit("0", "MB")).toBeNull();
  });
});

describe("parseLinkLines", () => {
  it("parses page|url|label lines", () => {
    expect(parseLinkLines("2|https://example.com|Example", 10)).toEqual([
      { page: 2, url: "https://example.com", label: "Example" },
    ]);
  });

  it("rejects invalid urls", () => {
    expect(parseLinkLines("1|not-a-url", 10)).toBeNull();
  });
});

describe("countAutoRotatedPages", () => {
  it("counts landscape pages for portrait mode", () => {
    const count = countAutoRotatedPages(
      [
        { width: 800, height: 600, rotation: 0 },
        { width: 600, height: 800, rotation: 0 },
      ],
      "portrait"
    );
    expect(count).toBe(1);
  });
});

describe("splitPDFBySize integration", () => {
  it("returns one part when the PDF fits under the limit", async () => {
    const input = await makeLabeledPdf("Split", 3);
    const parts = await splitPDFBySize(input, { maxBytes: 500_000 });
    expect(parts).toHaveLength(1);
    const doc = await PDFDocument.load(parts[0].bytes);
    expect(doc.getPageCount()).toBe(3);
  });

  it("splits a large PDF into multiple parts under the size limit", async () => {
    const filler = "Lorem ipsum dolor sit amet. ".repeat(1000);
    const input = await makeLabeledPdf("Split", 80, filler);
    const parts = await splitPDFBySize(input, { maxBytes: 52_000 });
    expect(parts.length).toBeGreaterThan(1);
    for (const part of parts) {
      expect(part.bytes.byteLength).toBeGreaterThan(0);
      expect(part.bytes.byteLength).toBeLessThanOrEqual(52_000);
    }
    const totalPages = (
      await Promise.all(parts.map((p) => PDFDocument.load(p.bytes)))
    ).reduce((sum, doc) => sum + doc.getPageCount(), 0);
    expect(totalPages).toBe(80);
  }, 30_000);
});

describe("mergeAlternatePages integration", () => {
  it("interleaves pages A1, B1, A2, B2", async () => {
    const [a, b] = await Promise.all([makeLabeledPdf("A", 2), makeLabeledPdf("B", 2)]);
    const merged = await mergeAlternatePages(a, b);
    const doc = await PDFDocument.load(merged);
    expect(doc.getPageCount()).toBe(4);
  });

  it("appends remaining pages from the longer file", async () => {
    const [a, b] = await Promise.all([makeLabeledPdf("A", 3), makeLabeledPdf("B", 1)]);
    const merged = await mergeAlternatePages(a, b);
    const doc = await PDFDocument.load(merged);
    expect(doc.getPageCount()).toBe(4);
  });
});

describe("addLinksToPDF integration", () => {
  it("returns a valid PDF with same page count", async () => {
    const input = await makeLabeledPdf("Link", 2);
    const entries = parseLinkLines("1|https://example.com|Visit", 2)!;
    const output = await addLinksToPDF(input, { entries });
    const doc = await PDFDocument.load(output);
    expect(doc.getPageCount()).toBe(2);
    expect(output.byteLength).toBeGreaterThan(0);
  });
});

describe("textToPDF integration", () => {
  it("creates a PDF from plain text with title", async () => {
    const output = await textToPDF({
      title: "Notes",
      text: "Hello world.\nSecond paragraph with more words to wrap.",
    });
    const doc = await PDFDocument.load(output);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
    expect(output.byteLength).toBeGreaterThan(500);
  });
});

describe("autoRotatePDF integration", () => {
  it("rotates landscape pages to portrait", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([800, 500]);
    doc.addPage([500, 800]);
    const input = await toBuffer(await doc.save());
    const output = await autoRotatePDF(input, "portrait");
    const rotated = await PDFDocument.load(output);
    expect(rotated.getPageCount()).toBe(2);
    const first = rotated.getPage(0);
    const { width, height } = first.getSize();
    const rot = first.getRotation().angle;
    const effective =
      rot === 90 || rot === 270 ? { width: height, height: width } : { width, height };
    expect(effective.height).toBeGreaterThanOrEqual(effective.width);
  });
});