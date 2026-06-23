import { csvToPDF } from "@/lib/pdf/csv-to-pdf";
import { summarizePdf } from "@/lib/pdf/summarize";
import { createPdfForm, parseFormFieldLines } from "@/lib/pdf/create-form";
import { markdownToPDF } from "@/lib/pdf/markdown-to-pdf";
import { imagesToPDF } from "@/lib/pdf/convert";
import { insertPages } from "@/lib/pdf/insert-pages";
import { overlayPdf } from "@/lib/pdf/overlay";
import { pdfToMarkdown } from "@/lib/pdf/pdf-to-markdown";
import { jsonToPdf } from "@/lib/pdf/json-to-pdf";
import { xmlToPdf } from "@/lib/pdf/xml-to-pdf";
import { addBlankPages } from "@/lib/pdf/add-blank-pages";
import { shufflePdfPages } from "@/lib/pdf/shuffle";
import { mirrorPdfPages } from "@/lib/pdf/mirror";
import { posterizePdf } from "@/lib/pdf/posterize";
import { fitPdfToA4 } from "@/lib/pdf/fit-to-page";
import { addPageLabels } from "@/lib/pdf/page-labels";
import { pdfToJson } from "@/lib/pdf/pdf-to-json";
import { tilePdf } from "@/lib/pdf/tile";
import { replacePageRange } from "@/lib/pdf/replace-pages";
import { addBackgroundColor } from "@/lib/pdf/background";
import { validatePdf } from "@/lib/pdf/validator";
import { splitEvenOdd } from "@/lib/pdf/split-even-odd";
import { exportBookmarksJson } from "@/lib/pdf/export-bookmarks";
import { addQrCodeToPdf } from "@/lib/pdf/qr-code";
import { createInvoicePdf } from "@/lib/pdf/invoice";
import { linearizePdf } from "@/lib/pdf/linearize";
import { duplicatePageRange } from "@/lib/pdf/duplicate-range";
import { sortPagesBySize } from "@/lib/pdf/sort-pages-size";
import { convertToPdfA3 } from "@/lib/pdf/pdfa3";
import { combineTextFilesToPdf } from "@/lib/pdf/combine-text";
import { stripMetadata } from "@/lib/pdf/remove-metadata";
import { splitEveryNPages } from "@/lib/pdf/split-every-n";
import { pdfToCsv } from "@/lib/pdf/pdf-to-csv";
import JSZip from "jszip";

export type GenericRunResult =
  | { kind: "pdf"; bytes: Uint8Array; filename: string }
  | { kind: "text"; content: string; filename: string }
  | { kind: "json"; content: string; filename: string }
  | { kind: "zip"; blob: Blob; filename: string }
  | { kind: "validate"; report: Record<string, unknown> }
  | { kind: "warnings"; bytes: Uint8Array; filename: string; warnings: string[] };

export interface GenericRunInput {
  toolId: string;
  file?: File | null;
  file2?: File | null;
  files?: File[];
  text?: string;
  url?: string;
  count?: number;
  n?: number;
  color?: string;
  labelFormat?: string;
  position?: number;
  from?: number;
  to?: number;
  invoice?: Record<string, string>;
}

export async function runGenericTool(input: GenericRunInput): Promise<GenericRunResult> {
  const { toolId, file, file2, files = [], text = "", url = "" } = input;

  switch (toolId) {
    case "csv-to-pdf": {
      const bytes = await csvToPDF(text);
      return { kind: "pdf", bytes, filename: "csv-data.pdf" };
    }
    case "pdf-to-csv": {
      if (!file) throw new Error("PDF required.");
      const csv = await pdfToCsv(await file.arrayBuffer());
      return { kind: "text", content: csv, filename: "export.csv" };
    }
    case "pdf-summary": {
      if (!file) throw new Error("PDF required.");
      const summary = await summarizePdf(await file.arrayBuffer());
      return { kind: "text", content: summary, filename: "summary.txt" };
    }
    case "create-pdf-form": {
      const fields = parseFormFieldLines(text);
      if (!fields?.length) throw new Error("Add fields: name|Label per line.");
      const bytes = await createPdfForm(fields);
      return { kind: "pdf", bytes, filename: "form.pdf" };
    }
    case "markdown-to-pdf": {
      const bytes = await markdownToPDF(text);
      return { kind: "pdf", bytes, filename: "markdown.pdf" };
    }
    case "bmp-to-pdf":
    case "gif-to-pdf":
    case "svg-to-pdf": {
      if (!files.length) throw new Error("Add image files.");
      const bytes = await imagesToPDF(files);
      return { kind: "pdf", bytes, filename: "images.pdf" };
    }
    case "combine-text-pdf": {
      if (!files.length) throw new Error("Add text files.");
      const bytes = await combineTextFilesToPdf(files);
      return { kind: "pdf", bytes, filename: "combined-text.pdf" };
    }
    case "insert-pages-pdf": {
      if (!file || !file2) throw new Error("Two PDFs required.");
      const bytes = await insertPages(await file.arrayBuffer(), await file2.arrayBuffer(), input.position ?? 1);
      return { kind: "pdf", bytes, filename: "inserted.pdf" };
    }
    case "overlay-pdf": {
      if (!file || !file2) throw new Error("Two PDFs required.");
      const bytes = await overlayPdf(await file.arrayBuffer(), await file2.arrayBuffer());
      return { kind: "pdf", bytes, filename: "overlay.pdf" };
    }
    case "replace-pages-pdf": {
      if (!file || !file2) throw new Error("Two PDFs required.");
      const bytes = await replacePageRange(
        await file.arrayBuffer(),
        await file2.arrayBuffer(),
        input.from ?? 1,
        input.to ?? 1
      );
      return { kind: "pdf", bytes, filename: "replaced.pdf" };
    }
    case "pdf-to-markdown": {
      if (!file) throw new Error("PDF required.");
      const md = await pdfToMarkdown(await file.arrayBuffer());
      return { kind: "text", content: md, filename: "export.md" };
    }
    case "json-to-pdf": {
      const bytes = await jsonToPdf(text);
      return { kind: "pdf", bytes, filename: "data.pdf" };
    }
    case "xml-to-pdf": {
      const bytes = await xmlToPdf(text);
      return { kind: "pdf", bytes, filename: "data.pdf" };
    }
    case "add-blank-pages": {
      if (!file) throw new Error("PDF required.");
      const bytes = await addBlankPages(await file.arrayBuffer(), input.count ?? 1, "end");
      return { kind: "pdf", bytes, filename: "with-blanks.pdf" };
    }
    case "shuffle-pdf": {
      if (!file) throw new Error("PDF required.");
      const bytes = await shufflePdfPages(await file.arrayBuffer());
      return { kind: "pdf", bytes, filename: "shuffled.pdf" };
    }
    case "mirror-pdf": {
      if (!file) throw new Error("PDF required.");
      const bytes = await mirrorPdfPages(await file.arrayBuffer());
      return { kind: "pdf", bytes, filename: "mirrored.pdf" };
    }
    case "posterize-pdf": {
      if (!file) throw new Error("PDF required.");
      const bytes = await posterizePdf(await file.arrayBuffer());
      return { kind: "pdf", bytes, filename: "posterized.pdf" };
    }
    case "fit-to-page-pdf": {
      if (!file) throw new Error("PDF required.");
      const bytes = await fitPdfToA4(await file.arrayBuffer());
      return { kind: "pdf", bytes, filename: "fitted.pdf" };
    }
    case "page-labels-pdf": {
      if (!file) throw new Error("PDF required.");
      const bytes = await addPageLabels(await file.arrayBuffer(), input.labelFormat ?? "Page {n}");
      return { kind: "pdf", bytes, filename: "labeled.pdf" };
    }
    case "tile-pdf": {
      if (!file) throw new Error("PDF required.");
      const bytes = await tilePdf(await file.arrayBuffer(), 2, 2);
      return { kind: "pdf", bytes, filename: "tiled.pdf" };
    }
    case "add-background-pdf": {
      if (!file) throw new Error("PDF required.");
      const bytes = await addBackgroundColor(await file.arrayBuffer(), input.color ?? "#f8fafc");
      return { kind: "pdf", bytes, filename: "background.pdf" };
    }
    case "linearize-pdf": {
      if (!file) throw new Error("PDF required.");
      const bytes = await linearizePdf(await file.arrayBuffer());
      return { kind: "pdf", bytes, filename: "linearized.pdf" };
    }
    case "duplicate-range-pdf": {
      if (!file) throw new Error("PDF required.");
      const bytes = await duplicatePageRange(await file.arrayBuffer(), input.from ?? 1, input.to ?? 1, 1);
      return { kind: "pdf", bytes, filename: "duplicated.pdf" };
    }
    case "sort-pages-size-pdf": {
      if (!file) throw new Error("PDF required.");
      const bytes = await sortPagesBySize(await file.arrayBuffer());
      return { kind: "pdf", bytes, filename: "sorted.pdf" };
    }
    case "remove-metadata-pdf": {
      if (!file) throw new Error("PDF required.");
      const bytes = await stripMetadata(await file.arrayBuffer());
      return { kind: "pdf", bytes, filename: "no-metadata.pdf" };
    }
    case "qr-code-pdf": {
      if (!file) throw new Error("PDF required.");
      const bytes = await addQrCodeToPdf(await file.arrayBuffer(), url || text);
      return { kind: "pdf", bytes, filename: "qr-stamped.pdf" };
    }
    case "pdf-to-json": {
      if (!file) throw new Error("PDF required.");
      const data = await pdfToJson(await file.arrayBuffer());
      return { kind: "json", content: JSON.stringify(data, null, 2), filename: "export.json" };
    }
    case "export-bookmarks-pdf": {
      if (!file) throw new Error("PDF required.");
      const data = await exportBookmarksJson(await file.arrayBuffer());
      return { kind: "json", content: data, filename: "bookmarks.json" };
    }
    case "pdf-validator": {
      if (!file) throw new Error("PDF required.");
      const report = await validatePdf(await file.arrayBuffer());
      return { kind: "validate", report: report as unknown as Record<string, unknown> };
    }
    case "split-even-odd": {
      if (!file) throw new Error("PDF required.");
      const [even, odd] = await splitEvenOdd(await file.arrayBuffer());
      const zip = new JSZip();
      zip.file("even-pages.pdf", even);
      zip.file("odd-pages.pdf", odd);
      return { kind: "zip", blob: await zip.generateAsync({ type: "blob" }), filename: "even-odd.zip" };
    }
    case "split-every-n-pages": {
      if (!file) throw new Error("PDF required.");
      const parts = await splitEveryNPages(await file.arrayBuffer(), input.n ?? 2);
      const zip = new JSZip();
      parts.forEach((bytes, i) => zip.file(`part-${i + 1}.pdf`, bytes));
      return { kind: "zip", blob: await zip.generateAsync({ type: "blob" }), filename: "split-n.zip" };
    }
    case "pdf-to-pdfa-3": {
      if (!file) throw new Error("PDF required.");
      const result = await convertToPdfA3(await file.arrayBuffer());
      return { kind: "warnings", bytes: result.bytes, filename: "pdfa-3.pdf", warnings: result.warnings };
    }
    case "invoice-pdf": {
      const bytes = await createInvoicePdf({
        invoiceNumber: input.invoice?.number,
        date: input.invoice?.date,
        toName: input.invoice?.toName,
        fromName: input.invoice?.fromName,
        notes: input.invoice?.notes,
        items: [{ description: input.invoice?.item ?? "Service", quantity: 1, unitPrice: Number(input.invoice?.amount ?? 0) }],
      });
      return { kind: "pdf", bytes, filename: "invoice.pdf" };
    }
    default:
      throw new Error(`Unknown tool: ${toolId}`);
  }
}
