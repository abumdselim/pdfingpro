import { PDFDocument } from "pdf-lib";
import { loadPdfDocument } from "../core";
import { getAdaptiveProfile } from "./memory";
import type { AdaptiveProfile, PdfSessionMeta } from "./types";

type PdfJsDoc = Awaited<ReturnType<typeof loadPdfDocument>>;

/**
 * Single-document session: read the file once, reuse pdf.js + pdf-lib handles,
 * and release everything on destroy().
 */
export class PdfSession {
  readonly fileName?: string;
  readonly byteLength: number;
  readonly profile: AdaptiveProfile;

  private buffer: ArrayBuffer | null = null;
  private pdfjsDoc: PdfJsDoc | null = null;
  private pdfLibDoc: PDFDocument | null = null;
  private pageCountValue: number | null = null;
  private destroyed = false;

  private constructor(fileName: string | undefined, byteLength: number, pageCount: number) {
    this.fileName = fileName;
    this.byteLength = byteLength;
    this.pageCountValue = pageCount;
    this.profile = getAdaptiveProfile(byteLength, pageCount);
  }

  static async fromFile(file: File): Promise<PdfSession> {
    const buffer = await file.arrayBuffer();
    const pdfjs = await loadPdfDocument(buffer);
    const session = new PdfSession(file.name, buffer.byteLength, pdfjs.numPages);
    session.buffer = buffer;
    session.pdfjsDoc = pdfjs;
    return session;
  }

  static async fromBuffer(buffer: ArrayBuffer, fileName?: string): Promise<PdfSession> {
    const pdfjs = await loadPdfDocument(buffer);
    const session = new PdfSession(fileName, buffer.byteLength, pdfjs.numPages);
    session.buffer = buffer;
    session.pdfjsDoc = pdfjs;
    return session;
  }

  get pageCount(): number {
    this.assertAlive();
    return this.pageCountValue ?? 0;
  }

  get meta(): PdfSessionMeta {
    return {
      fileName: this.fileName,
      byteLength: this.byteLength,
      pageCount: this.pageCount,
    };
  }

  async getBuffer(): Promise<ArrayBuffer> {
    this.assertAlive();
    if (!this.buffer) {
      throw new Error("PDF buffer is unavailable.");
    }
    return this.buffer;
  }

  async getPdfJs(): Promise<PdfJsDoc> {
    this.assertAlive();
    if (!this.pdfjsDoc) {
      const buffer = await this.getBuffer();
      this.pdfjsDoc = await loadPdfDocument(buffer);
      this.pageCountValue = this.pdfjsDoc.numPages;
    }
    return this.pdfjsDoc;
  }

  async getPdfLib(): Promise<PDFDocument> {
    this.assertAlive();
    if (!this.pdfLibDoc) {
      const buffer = await this.getBuffer();
      this.pdfLibDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    }
    return this.pdfLibDoc;
  }

  async renderPage(pageNumber: number, scale?: number): Promise<HTMLCanvasElement> {
    const pdf = await this.getPdfJs();
    const resolvedScale = scale ?? this.profile.renderScale;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: resolvedScale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
    return canvas;
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    try {
      this.pdfjsDoc?.destroy();
    } catch {
      // ignore
    }
    this.pdfjsDoc = null;
    this.pdfLibDoc = null;
    this.buffer = null;
    this.pageCountValue = null;
  }

  private assertAlive() {
    if (this.destroyed) {
      throw new Error("PDF session has been closed.");
    }
  }
}
