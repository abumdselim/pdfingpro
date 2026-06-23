import { pdfToImages } from "./convert";
import { yieldToMain } from "./engine/memory";

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function pdfToPowerPoint(
  arrayBuffer: ArrayBuffer,
  onProgress?: (page: number, total: number) => void
): Promise<Blob> {
  const { default: pptxgen } = await import("pptxgenjs");
  const images = await pdfToImages(arrayBuffer, "jpeg", 1.6, 0.9, onProgress);
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Pdfing Pro";
  pptx.subject = "Converted from PDF";

  for (let i = 0; i < images.length; i++) {
    onProgress?.(i + 1, images.length);
    const { blob } = images[i];
    const base64 = await blobToBase64(blob);
    const slide = pptx.addSlide();
    slide.addImage({
      data: `image/jpeg;base64,${base64}`,
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      sizing: { type: "contain", w: "100%", h: "100%" },
    });
    await yieldToMain();
  }

  const output = await pptx.write({ outputType: "blob" });
  return output as Blob;
}
