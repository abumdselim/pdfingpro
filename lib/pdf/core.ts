// Lazy-load pdfjs-dist so it only runs in the browser.
// Worker is self-hosted from /public/pdfjs (copied on postinstall).
import { releaseCanvas, yieldToMain } from "./engine/memory";
import { PdfSession } from "./engine/session";
import { streamThumbnails } from "./engine/processor";

let _pdfjs: typeof import("pdfjs-dist") | null = null;

export async function getPdfJs() {
  if (_pdfjs) return _pdfjs;
  _pdfjs = await import("pdfjs-dist");
  _pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";
  return _pdfjs;
}

export async function loadPdfDocument(arrayBuffer: ArrayBuffer) {
  const pdfjs = await getPdfJs();
  // .slice(0) creates an independent copy so pdfjs can transfer it to its
  // worker without detaching the caller's buffer.
  return pdfjs.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) }).promise;
}

/** Render one page from an already-loaded PDFDocumentProxy. */
export async function renderPageFromDoc(
  pdf: Awaited<ReturnType<typeof loadPdfDocument>>,
  pageNumber: number,
  scale: number
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
  return canvas;
}

/**
 * Render a single PDF page to canvas.
 * Pass `existingPdf` when looping pages to avoid reloading the document.
 */
export async function renderPageToCanvas(
  arrayBuffer: ArrayBuffer,
  pageNumber: number,
  scale = 1.5,
  existingPdf?: Awaited<ReturnType<typeof loadPdfDocument>>
): Promise<HTMLCanvasElement> {
  const pdf = existingPdf ?? (await loadPdfDocument(arrayBuffer));
  return renderPageFromDoc(pdf, pageNumber, scale);
}

/** Render all page thumbnails — one pdf.js load, memory released per page. */
export async function renderAllPageThumbnails(
  arrayBuffer: ArrayBuffer,
  scale = 0.3
): Promise<string[]> {
  const session = await PdfSession.fromBuffer(arrayBuffer);
  const thumbnails: string[] = new Array(session.pageCount);

  try {
    await streamThumbnails({
      session,
      scale,
      onPage: (index, dataUrl) => {
        thumbnails[index] = dataUrl;
      },
    });
    return thumbnails;
  } finally {
    session.destroy();
  }
}

/** Stream thumbnails with progressive callback (preferred for large PDFs). */
export { streamThumbnails } from "./engine/processor";
export { PdfSession } from "./engine/session";

/** Return the page count of a PDF without fully loading it. */
export async function getPdfPageCount(arrayBuffer: ArrayBuffer): Promise<number> {
  const pdf = await loadPdfDocument(arrayBuffer);
  const count = pdf.numPages;
  try {
    pdf.destroy();
  } catch {
    // ignore
  }
  return count;
}

/** Open a session from a user file — preferred entry point for tools. */
export async function openPdfFile(file: File): Promise<PdfSession> {
  return PdfSession.fromFile(file);
}

export { releaseCanvas, yieldToMain };
