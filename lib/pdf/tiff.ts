import { PDFDocument } from "pdf-lib";
import { releaseCanvas, yieldToMain } from "./engine/memory";

interface TiffDecoder {
  decode(buffer: ArrayBuffer): TiffPage[];
  decodeImage(buffer: ArrayBuffer, page: TiffPage): void;
  toRGBA8(page: TiffPage): Uint8Array;
}

interface TiffPage {
  width: number;
  height: number;
}

async function loadUtif(): Promise<TiffDecoder> {
  const mod = await import("utif");
  return (mod.default ?? mod) as TiffDecoder;
}

async function tiffPageToJpegBytes(buffer: ArrayBuffer, page: TiffPage, utif: TiffDecoder): Promise<Uint8Array> {
  utif.decodeImage(buffer, page);
  const rgba = utif.toRGBA8(page);

  const canvas = document.createElement("canvas");
  canvas.width = page.width;
  canvas.height = page.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available.");

  const imageData = ctx.createImageData(page.width, page.height);
  imageData.data.set(rgba);
  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (!value) reject(new Error("Could not encode TIFF page."));
      else resolve(value);
    }, "image/jpeg", 0.92);
  });

  releaseCanvas(canvas);
  return new Uint8Array(await blob.arrayBuffer());
}

/** Convert TIFF images (including multi-page) into a single PDF. */
export async function tiffFilesToPDF(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const utif = await loadUtif();

  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const pages = utif.decode(buffer);
    if (!pages.length) {
      throw new Error(`No TIFF pages found in ${file.name}.`);
    }

    for (const page of pages) {
      const jpgBytes = await tiffPageToJpegBytes(buffer, page, utif);
      const img = await doc.embedJpg(jpgBytes);
      const pdfPage = doc.addPage([img.width, img.height]);
      pdfPage.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      await yieldToMain();
    }
  }

  return doc.save();
}
