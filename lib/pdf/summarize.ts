import { extractTextFromPdf } from "./extract-text";

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

/** Extractive summary: key sentences from PDF text (browser-only, no AI API). */
export async function summarizePdf(
  buffer: ArrayBuffer,
  maxSentences = 12,
  onProgress?: (page: number, total: number) => void
): Promise<string> {
  const fullText = await extractTextFromPdf(buffer, onProgress);
  const body = fullText.replace(/--- Page \d+ ---/g, "\n");
  const sentences = splitSentences(body);
  const unique = [...new Set(sentences)];
  const selected = unique.slice(0, maxSentences);

  if (!selected.length) {
    return "No extractable text found for summarization. Try OCR PDF first for scanned documents.";
  }

  return [
    "# PDF Summary",
    "",
    "This is an extractive summary (important sentences from the document).",
    "",
    ...selected.map((s, i) => `${i + 1}. ${s}`),
    "",
    `— ${selected.length} of ${unique.length} sentence(s) shown`,
  ].join("\n");
}
