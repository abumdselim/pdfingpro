import { PDFDocument } from "pdf-lib";

/** Embed the first page of `overlayBuffer` on every page of `baseBuffer`. */
export async function overlayPdf(
  baseBuffer: ArrayBuffer,
  overlayBuffer: ArrayBuffer
): Promise<Uint8Array> {
  const base = await PDFDocument.load(baseBuffer, { ignoreEncryption: true });
  const overlay = await PDFDocument.load(overlayBuffer, { ignoreEncryption: true });

  if (overlay.getPageCount() === 0) {
    throw new Error("Overlay PDF has no pages.");
  }

  const overlayPage = overlay.getPage(0);
  const embedded = await base.embedPage(overlayPage);
  const { width: ow, height: oh } = overlayPage.getSize();

  for (const page of base.getPages()) {
    const { width, height } = page.getSize();
    const scale = Math.min(width / ow, height / oh);
    const drawW = ow * scale;
    const drawH = oh * scale;

    page.drawPage(embedded, {
      x: (width - drawW) / 2,
      y: (height - drawH) / 2,
      width: drawW,
      height: drawH,
    });
  }

  return base.save();
}
