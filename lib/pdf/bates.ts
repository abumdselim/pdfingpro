import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PageNumberPosition } from "./pagenumbers";

export interface BatesNumberOptions {
  prefix?: string;
  suffix?: string;
  startAt?: number;
  digits?: number;
  position?: PageNumberPosition;
  fontSize?: number;
  margin?: number;
}

export function formatBatesNumber(
  prefix: string,
  number: number,
  digits: number,
  suffix = ""
): string {
  return `${prefix}${String(number).padStart(digits, "0")}${suffix}`;
}

/** Stamp Bates numbers (e.g. ACME-000001) on every page. */
export async function addBatesNumbers(
  arrayBuffer: ArrayBuffer,
  opts: BatesNumberOptions = {}
): Promise<Uint8Array> {
  const {
    prefix = "",
    suffix = "",
    startAt = 1,
    digits = 6,
    position = "bottom-right",
    fontSize = 10,
    margin = 24,
  } = opts;

  const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const label = formatBatesNumber(prefix, startAt + index, digits, suffix);
    const textWidth = font.widthOfTextAtSize(label, fontSize);

    let x: number;
    let y: number;

    switch (position) {
      case "bottom-center":
        x = (width - textWidth) / 2;
        y = margin;
        break;
      case "bottom-left":
        x = margin;
        y = margin;
        break;
      case "bottom-right":
        x = width - textWidth - margin;
        y = margin;
        break;
      case "top-center":
        x = (width - textWidth) / 2;
        y = height - margin - fontSize;
        break;
      case "top-left":
        x = margin;
        y = height - margin - fontSize;
        break;
      case "top-right":
        x = width - textWidth - margin;
        y = height - margin - fontSize;
        break;
    }

    page.drawText(label, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.15, 0.15, 0.15),
    });
  });

  return doc.save();
}
