import { textToPDF } from "./text-to-pdf";

/** Render pretty-printed JSON as a readable PDF. */
export async function jsonToPdf(jsonString: string): Promise<Uint8Array> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("Invalid JSON input.");
  }

  const pretty = JSON.stringify(parsed, null, 2);
  return textToPDF({ text: pretty, title: "JSON Document", fontSize: 10, lineHeight: 14 });
}
