import { textToPDF } from "./text-to-pdf";

/** Convert a subset of Markdown (headings, lists, paragraphs) to PDF via plain text layout. */
export async function markdownToPDF(markdown: string, title?: string): Promise<Uint8Array> {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      out.push("");
      continue;
    }
    if (trimmed.startsWith("### ")) out.push(trimmed.slice(4).toUpperCase());
    else if (trimmed.startsWith("## ")) out.push(trimmed.slice(3).toUpperCase());
    else if (trimmed.startsWith("# ")) out.push(trimmed.slice(2).toUpperCase());
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) out.push(`• ${trimmed.slice(2)}`);
    else out.push(trimmed.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1"));
  }

  return textToPDF({ text: out.join("\n"), title });
}
