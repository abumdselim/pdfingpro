import { PDFDocument } from "pdf-lib";
import { releaseCanvas, yieldToMain } from "./engine/memory";

/** Convert HEIC/HEIF images to a single PDF. */
export async function heicFilesToPDF(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const heic2any = (await import("heic2any")).default;

  for (const file of files) {
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });

    const blobs = Array.isArray(converted) ? converted : [converted];
    for (const blob of blobs) {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const img = await doc.embedJpg(bytes);
      const page = doc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      await yieldToMain();
    }
  }

  return doc.save();
}
