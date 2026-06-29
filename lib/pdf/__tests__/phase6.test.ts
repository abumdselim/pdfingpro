import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { addAttachmentsToPdf } from "@/lib/pdf/attachments";
import { runBatchWorkflow } from "@/lib/pdf/batch-workflow";

async function makePdf(pages = 1): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([400, 500]);
    page.drawText(`Page ${i + 1}`, { x: 50, y: 450, size: 14, font, color: rgb(0, 0, 0) });
  }
  const bytes = await doc.save();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

describe("addAttachmentsToPdf", () => {
  it("returns a valid PDF after embedding attachments", async () => {
    const input = await makePdf();
    const output = await addAttachmentsToPdf(input, [
      {
        filename: "notes.txt",
        bytes: new TextEncoder().encode("Hello attachment"),
        mimeType: "text/plain",
      },
    ]);
    const doc = await PDFDocument.load(output);
    expect(doc.getPageCount()).toBe(1);
    expect(output.byteLength).toBeGreaterThan(input.byteLength);
  });
});

describe("runBatchWorkflow", () => {
  it("rotates a PDF through the pipeline", async () => {
    const input = await makePdf(1);
    const output = await runBatchWorkflow({
      files: [input],
      steps: ["rotate"],
      rotation: 90,
    });
    const doc = await PDFDocument.load(output);
    expect(doc.getPageCount()).toBe(1);
    expect(doc.getPage(0).getRotation().angle).toBe(90);
  });

  it("requires at least one step", async () => {
    const input = await makePdf();
    await expect(runBatchWorkflow({ files: [input], steps: [] })).rejects.toThrow(/step/i);
  });
});
