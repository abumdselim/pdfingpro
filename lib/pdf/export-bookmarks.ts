import { readPdfBookmarks, type PdfBookmark } from "./bookmarks";

/** Export PDF outline/bookmarks as a JSON string. */
export async function exportBookmarksJson(buffer: ArrayBuffer): Promise<string> {
  const bookmarks: PdfBookmark[] = await readPdfBookmarks(buffer);
  return JSON.stringify({ bookmarks }, null, 2);
}
