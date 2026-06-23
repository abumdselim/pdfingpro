import { PDFDocument } from "pdf-lib";
import { loadPdfDocument } from "./core";

export type PreflightStatus = "pass" | "warn" | "fail";

export interface PreflightCheck {
  id: string;
  label: string;
  status: PreflightStatus;
  detail: string;
}

export interface PdfaPreflightReport {
  overall: PreflightStatus;
  score: number;
  pageCount: number;
  encrypted: boolean;
  checks: PreflightCheck[];
}

function statusScore(status: PreflightStatus): number {
  if (status === "pass") return 1;
  if (status === "warn") return 0.5;
  return 0;
}

/** Heuristic PDF/A readiness checks (browser — not ISO certification). */
export async function runPdfaPreflight(buffer: ArrayBuffer): Promise<PdfaPreflightReport> {
  const checks: PreflightCheck[] = [];

  let pageCount = 0;
  let encrypted = false;
  let producer = "";
  let creator = "";
  let title = "";

  try {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    pageCount = doc.getPageCount();
    encrypted = doc.isEncrypted;
    producer = doc.getProducer() ?? "";
    creator = doc.getCreator() ?? "";
    title = doc.getTitle() ?? "";
  } catch {
    return {
      overall: "fail",
      score: 0,
      pageCount: 0,
      encrypted: false,
      checks: [
        {
          id: "load",
          label: "PDF loads",
          status: "fail",
          detail: "The file could not be opened as a PDF.",
        },
      ],
    };
  }

  checks.push({
    id: "load",
    label: "PDF loads",
    status: "pass",
    detail: `Document opened successfully (${pageCount} page${pageCount === 1 ? "" : "s"}).`,
  });

  checks.push({
    id: "pages",
    label: "Page count",
    status: pageCount > 0 ? "pass" : "fail",
    detail: pageCount > 0 ? `${pageCount} pages detected.` : "No pages found.",
  });

  checks.push({
    id: "encryption",
    label: "Encryption",
    status: encrypted ? "warn" : "pass",
    detail: encrypted
      ? "Document is encrypted. PDF/A archival copies usually require an unencrypted export."
      : "Document is not encrypted.",
  });

  const hasMetadata = Boolean(title.trim() || producer.trim() || creator.trim());
  checks.push({
    id: "metadata",
    label: "Document metadata",
    status: hasMetadata ? "pass" : "warn",
    detail: hasMetadata
      ? "Title, producer, or creator metadata is present."
      : "Missing title/producer metadata — archival workflows often require descriptive metadata.",
  });

  let extractableTextPages = 0;
  try {
    const pdf = await loadPdfDocument(buffer);
    try {
      const sample = Math.min(pdf.numPages, 5);
      for (let i = 1; i <= sample; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join("")
          .trim();
        if (text.length > 0) extractableTextPages++;
      }
    } finally {
      pdf.destroy();
    }
  } catch {
    // ignore text sampling errors
  }

  checks.push({
    id: "text-layer",
    label: "Searchable text (sample)",
    status: extractableTextPages > 0 ? "pass" : "warn",
    detail:
      extractableTextPages > 0
        ? `Text found on ${extractableTextPages} of the first ${Math.min(pageCount, 5)} sampled pages.`
        : "No extractable text detected in the sample — scanned-only PDFs need OCR before archival use.",
  });

  checks.push({
    id: "fonts-icc",
    label: "Fonts & color profiles",
    status: "warn",
    detail:
      "Full font embedding and ICC profile validation requires server-side PDF/A tooling. This browser check cannot certify compliance.",
  });

  checks.push({
    id: "iso",
    label: "ISO 19005 compliance",
    status: "warn",
    detail:
      "This is a readiness preflight only. Use server PDF/A export or veraPDF for formal validation.",
  });

  const score =
    Math.round((checks.reduce((sum, c) => sum + statusScore(c.status), 0) / checks.length) * 100);

  const overall: PreflightStatus = checks.some((c) => c.status === "fail")
    ? "fail"
    : checks.some((c) => c.status === "warn")
      ? "warn"
      : "pass";

  return { overall, score, pageCount, encrypted, checks };
}
