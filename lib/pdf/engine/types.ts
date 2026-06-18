import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PDFDocument } from "pdf-lib";

export type EngineTier = "normal" | "large" | "xlarge" | "extreme";

export interface AdaptiveProfile {
  tier: EngineTier;
  thumbnailScale: number;
  renderScale: number;
  yieldMs: number;
  thumbnailPauseMs: number;
}

export interface EngineProgress {
  page: number;
  total: number;
  phase?: string;
}

export interface PdfSessionMeta {
  fileName?: string;
  byteLength: number;
  pageCount: number;
}

export interface PdfSessionSources {
  buffer: ArrayBuffer;
  pdfjs: PDFDocumentProxy;
  pdfLib: PDFDocument;
}
