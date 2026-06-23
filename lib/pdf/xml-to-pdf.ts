import { textToPDF } from "./text-to-pdf";

/** Render XML text as a formatted PDF document. */
export async function xmlToPdf(xml: string): Promise<Uint8Array> {
  const trimmed = xml.trim();
  if (!trimmed) throw new Error("XML input is empty.");
  return textToPDF({ text: trimmed, title: "XML Document", fontSize: 10, lineHeight: 14 });
}
