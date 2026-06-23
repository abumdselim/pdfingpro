import { textToPDF } from "./text-to-pdf";

/** Merge multiple text files into one PDF with section headings. */
export async function combineTextFilesToPdf(files: File[]): Promise<Uint8Array> {
  if (files.length === 0) throw new Error("Select at least one text file.");

  const sections: string[] = [];

  for (const file of files) {
    const text = await file.text();
    sections.push(`=== ${file.name} ===\n\n${text.trim()}\n`);
  }

  return textToPDF({
    text: sections.join("\n"),
    title: "Combined Text Files",
    fontSize: 11,
    lineHeight: 15,
  });
}
