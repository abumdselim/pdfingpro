import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { runPdfaPreflight } from "@/lib/pdf/pdfa-preflight";

async function samplePdf(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  doc.setTitle("Sample");
  doc.setProducer("Pdfing Pro Test");
  const page = doc.addPage();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText("Hello archival check", { x: 72, y: 700, size: 14, font });
  const bytes = await doc.save();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe("runPdfaPreflight", () => {
  it("returns a structured report for a valid PDF", async () => {
    const report = await runPdfaPreflight(await samplePdf());
    expect(report.pageCount).toBe(1);
    expect(report.checks.some((c) => c.id === "load" && c.status === "pass")).toBe(true);
    expect(report.score).toBeGreaterThan(0);
  });
});
