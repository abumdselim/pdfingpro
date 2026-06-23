import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function toRoman(n: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let num = Math.max(1, Math.floor(n));
  let out = "";
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      out += syms[i];
      num -= vals[i];
    }
  }
  return out.toLowerCase();
}

function toAlpha(n: number): string {
  let num = Math.max(1, Math.floor(n));
  let out = "";
  while (num > 0) {
    num -= 1;
    out = String.fromCharCode(65 + (num % 26)) + out;
    num = Math.floor(num / 26);
  }
  return out;
}

function formatLabel(format: string, pageIndex: number): string {
  const n = pageIndex + 1;
  return format
    .replace(/\{n\}/gi, String(n))
    .replace(/\{roman\}/gi, toRoman(n))
    .replace(/\{alpha\}/gi, toAlpha(n));
}

export interface PageLabelOptions {
  format?: string;
  fontSize?: number;
  margin?: number;
}

/** Draw custom page labels (e.g. `A-{n}`, `{roman}`, `Page {alpha}`). */
export async function addPageLabels(
  buffer: ArrayBuffer,
  format = "A-{n}",
  options: PageLabelOptions = {}
): Promise<Uint8Array> {
  const { fontSize = 11, margin = 24 } = options;
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);

  doc.getPages().forEach((page, i) => {
    const { width } = page.getSize();
    const label = formatLabel(format, i);
    const textWidth = font.widthOfTextAtSize(label, fontSize);

    page.drawText(label, {
      x: (width - textWidth) / 2,
      y: margin,
      size: fontSize,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });
  });

  return doc.save();
}
