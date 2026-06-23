import { reorganizePages } from "./organize";

/** Build a new PDF from selected page indices (0-indexed). */
export async function extractPagesToPdf(
  buffer: ArrayBuffer,
  pageIndices: number[]
): Promise<Uint8Array> {
  const sorted = [...new Set(pageIndices)].sort((a, b) => a - b);
  if (sorted.length === 0) throw new Error("Select at least one page.");
  return reorganizePages(buffer, sorted);
}
