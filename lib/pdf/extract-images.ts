import { loadPdfDocument } from "./core";
import { yieldToMain } from "./engine/memory";

export interface ExtractedImage {
  page: number;
  index: number;
  blob: Blob;
  width: number;
  height: number;
  filename: string;
}

/** Extract embedded images from PDF pages using pdf.js XObject refs. */
export async function extractImagesFromPdf(
  buffer: ArrayBuffer,
  onProgress?: (page: number, total: number) => void
): Promise<ExtractedImage[]> {
  const pdf = await loadPdfDocument(buffer);
  const results: ExtractedImage[] = [];

  try {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      onProgress?.(pageNum, pdf.numPages);
      const page = await pdf.getPage(pageNum);
      const ops = await page.getOperatorList();
      const objs = page.objs;
      let imgIndex = 0;

      for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i];
        // paintImageXObject = 85, paintJpegXObject = 86
        if (fn !== 85 && fn !== 86) continue;
        const objId = ops.argsArray[i][0];
        if (!objId) continue;

        try {
          const imgData = await new Promise<{ data: Uint8ClampedArray; width: number; height: number } | null>(
            (resolve) => {
              objs.get(objId, (data: { data: Uint8ClampedArray; width: number; height: number }) => {
                resolve(data);
              });
            }
          );

          if (!imgData?.data) continue;

          const canvas = document.createElement("canvas");
          canvas.width = imgData.width;
          canvas.height = imgData.height;
          const ctx = canvas.getContext("2d")!;
          const imageData = ctx.createImageData(imgData.width, imgData.height);
          imageData.data.set(imgData.data);
          ctx.putImageData(imageData, 0, 0);

          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to encode image"))), "image/png");
          });

          imgIndex++;
          results.push({
            page: pageNum,
            index: imgIndex,
            blob,
            width: imgData.width,
            height: imgData.height,
            filename: `page-${pageNum}-image-${imgIndex}.png`,
          });
        } catch {
          // skip unreadable image objects
        }
      }

      if (pageNum < pdf.numPages) await yieldToMain();
    }
  } finally {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  }

  return results;
}
