import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface TextToPdfOptions {
  text: string;
  fontSize?: number;
  lineHeight?: number;
  margin?: number;
  title?: string;
}

function wrapLine(text: string, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

export async function textToPDF(options: TextToPdfOptions): Promise<Uint8Array> {
  const { text, fontSize = 12, lineHeight = 16, margin = 56, title } = options;
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const maxWidth = pageWidth - margin * 2;

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  if (title?.trim()) {
    page.drawText(title.trim(), {
      x: margin,
      y,
      size: fontSize + 4,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= lineHeight * 2;
  }

  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");

  for (const paragraph of paragraphs) {
    const lines = paragraph.trim() === "" ? [""] : wrapLine(paragraph, font, fontSize, maxWidth);

    for (const line of lines) {
      if (y < margin + lineHeight) {
        page = doc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      if (line) {
        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0.15, 0.15, 0.15),
        });
      }

      y -= lineHeight;
    }

    y -= lineHeight * 0.35;
  }

  return doc.save();
}
