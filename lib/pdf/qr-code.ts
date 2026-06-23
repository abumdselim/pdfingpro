import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";

async function qrPngBytes(url: string, size: number): Promise<Uint8Array> {
  const dataUrl = await QRCode.toDataURL(url, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
  });
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Stamp a QR code linking to `url` on every page (bottom-right). */
export async function addQrCodeToPdf(
  buffer: ArrayBuffer,
  url: string,
  size = 96
): Promise<Uint8Array> {
  const trimmed = url.trim();
  if (!trimmed) throw new Error("URL is required.");

  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pngBytes = await qrPngBytes(trimmed, size);
  const qrImage = await doc.embedPng(pngBytes);
  const margin = 24;
  const drawSize = size;

  for (const page of doc.getPages()) {
    const { width } = page.getSize();
    page.drawImage(qrImage, {
      x: width - margin - drawSize,
      y: margin,
      width: drawSize,
      height: drawSize,
    });
  }

  return doc.save();
}
