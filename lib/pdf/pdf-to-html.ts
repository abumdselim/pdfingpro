import { loadPdfDocument } from "./core";
import { yieldToMain } from "./engine/memory";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Convert PDF text content into a simple HTML document. */
export async function pdfToHtml(
  buffer: ArrayBuffer,
  onProgress?: (page: number, total: number) => void
): Promise<string> {
  const pdf = await loadPdfDocument(buffer);
  const sections: string[] = [];

  try {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      onProgress?.(pageNum, pdf.numPages);
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      sections.push(
        `<section class="pdf-page" data-page="${pageNum}">` +
          `<h2>Page ${pageNum}</h2>` +
          `<p>${escapeHtml(text || "(no extractable text)")}</p>` +
          `</section>`
      );

      if (pageNum < pdf.numPages) await yieldToMain();
    }
  } finally {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PDF export</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 48rem; margin: 2rem auto; padding: 0 1rem; color: #1e293b; }
    .pdf-page { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; }
    h2 { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    p { white-space: pre-wrap; }
  </style>
</head>
<body>
${sections.join("\n")}
</body>
</html>`;
}
