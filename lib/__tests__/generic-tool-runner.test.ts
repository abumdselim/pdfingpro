import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { runGenericTool } from "@/lib/generic-tool-runner";
import { createTestPdf } from "@/lib/pdf/__tests__/helpers";

function mockPdfFile(buffer: ArrayBuffer, name = "test.pdf"): File {
  return new File([buffer], name, { type: "application/pdf" });
}

describe("runGenericTool", () => {
  it("throws for unknown tools", async () => {
    await expect(runGenericTool({ toolId: "not-a-real-tool" })).rejects.toThrow(/Unknown tool/);
  });

  it("converts CSV text to a PDF", async () => {
    const out = await runGenericTool({
      toolId: "csv-to-pdf",
      text: "name,score\nAda,99\nBob,87",
    });
    expect(out.kind).toBe("pdf");
    if (out.kind !== "pdf") return;
    const doc = await PDFDocument.load(out.bytes);
    expect(doc.getPageCount()).toBeGreaterThan(0);
  });

  it("adds blank pages to a PDF", async () => {
    const buffer = await createTestPdf(1);
    const out = await runGenericTool({
      toolId: "add-blank-pages",
      file: mockPdfFile(buffer),
      count: 2,
    });
    expect(out.kind).toBe("pdf");
    if (out.kind !== "pdf") return;
    const doc = await PDFDocument.load(out.bytes);
    expect(doc.getPageCount()).toBe(3);
  });

  it("validates a PDF and returns a report", async () => {
    const buffer = await createTestPdf(2);
    const out = await runGenericTool({
      toolId: "pdf-validator",
      file: mockPdfFile(buffer),
    });
    expect(out.kind).toBe("validate");
    if (out.kind !== "validate") return;
    expect(out.report).toMatchObject({ valid: true, pages: 2 });
  });

  it("renders JSON input as a PDF", async () => {
    const out = await runGenericTool({
      toolId: "json-to-pdf",
      text: JSON.stringify({ hello: "world" }),
    });
    expect(out.kind).toBe("pdf");
    if (out.kind !== "pdf") return;
    const doc = await PDFDocument.load(out.bytes);
    expect(doc.getPageCount()).toBe(1);
  });
});
