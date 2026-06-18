import { releaseCanvas, yieldToMain } from "./memory";
import type { PdfSession } from "./session";
import type { EngineProgress } from "./types";

export interface ProcessPagesOptions<T> {
  session: PdfSession;
  startPage?: number;
  endPage?: number;
  onProgress?: (progress: EngineProgress) => void;
  signal?: AbortSignal;
  processPage: (pageNumber: number, pageIndex: number) => Promise<T>;
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Processing cancelled.", "AbortError");
  }
}

/** Walk pages sequentially, yielding to the UI between each step. */
export async function processPages<T>({
  session,
  startPage = 1,
  endPage,
  onProgress,
  signal,
  processPage,
}: ProcessPagesOptions<T>): Promise<T[]> {
  const total = endPage ?? session.pageCount;
  const from = Math.max(1, startPage);
  const to = Math.min(total, session.pageCount);
  const results: T[] = [];
  const { yieldMs } = session.profile;

  for (let page = from; page <= to; page += 1) {
    assertNotAborted(signal);
    onProgress?.({ page, total: to, phase: "processing" });
    results.push(await processPage(page, page - 1));
    if (yieldMs > 0) {
      await yieldToMain(yieldMs);
    } else {
      await yieldToMain();
    }
  }

  return results;
}

export interface ThumbnailStreamOptions {
  session: PdfSession;
  scale?: number;
  onPage: (pageIndex: number, dataUrl: string) => void;
  onProgress?: (progress: EngineProgress) => void;
  signal?: AbortSignal;
}

/** Render thumbnails one page at a time to avoid holding hundreds in memory. */
export async function streamThumbnails({
  session,
  scale,
  onPage,
  onProgress,
  signal,
}: ThumbnailStreamOptions): Promise<number> {
  const pdf = await session.getPdfJs();
  const total = pdf.numPages;
  const resolvedScale = scale ?? session.profile.thumbnailScale;
  const pauseMs = session.profile.thumbnailPauseMs;

  for (let page = 1; page <= total; page += 1) {
    assertNotAborted(signal);
    onProgress?.({ page, total, phase: "thumbnail" });

    const canvas = await session.renderPage(page, resolvedScale);
    onPage(page - 1, canvas.toDataURL("image/jpeg", 0.72));
    releaseCanvas(canvas);

    if (pauseMs > 0) {
      await yieldToMain(pauseMs);
    } else {
      await yieldToMain();
    }
  }

  return total;
}
