import { PDFDocument } from "pdf-lib";

export type ImagePlacementPreset = "center" | "top-left" | "bottom-right" | "full-page";

export interface AddImageOptions {
  pageIndex: number;
  preset?: ImagePlacementPreset;
  /** Width as fraction of page width (ignored for full-page). */
  widthFrac?: number;
}

function presetBox(preset: ImagePlacementPreset, widthFrac: number) {
  switch (preset) {
    case "top-left":
      return { xFrac: 0.05, yFrac: 0.05, wFrac: widthFrac, hFrac: widthFrac * 0.75 };
    case "bottom-right":
      return { xFrac: 1 - widthFrac - 0.05, yFrac: 1 - widthFrac * 0.75 - 0.05, wFrac: widthFrac, hFrac: widthFrac * 0.75 };
    case "full-page":
      return { xFrac: 0, yFrac: 0, wFrac: 1, hFrac: 1 };
    default:
      return {
        xFrac: (1 - widthFrac) / 2,
        yFrac: (1 - widthFrac * 0.75) / 2,
        wFrac: widthFrac,
        hFrac: widthFrac * 0.75,
      };
  }
}

/** Draw an image onto a single PDF page. */
export async function addImageToPdf(
  pdfBuffer: ArrayBuffer,
  imageBuffer: ArrayBuffer,
  mimeType: string,
  options: AddImageOptions
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = doc.getPages();
  const page = pages[Math.min(Math.max(0, options.pageIndex), pages.length - 1)];
  if (!page) throw new Error("PDF has no pages.");

  const bytes = new Uint8Array(imageBuffer);
  const image =
    mimeType === "image/png" || mimeType === "image/webp"
      ? await doc.embedPng(bytes)
      : await doc.embedJpg(bytes);

  const { width: pageW, height: pageH } = page.getSize();
  const preset = options.preset ?? "center";
  const widthFrac = options.widthFrac ?? 0.35;
  const box = presetBox(preset, widthFrac);

  const drawW = box.wFrac * pageW;
  const drawH = preset === "full-page" ? (image.height / image.width) * drawW : box.hFrac * pageH;
  const x = box.xFrac * pageW;
  const y = pageH - box.yFrac * pageH - drawH;

  page.drawImage(image, { x, y, width: drawW, height: drawH });
  return doc.save();
}
