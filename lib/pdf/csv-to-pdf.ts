import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

export function parseCsv(text: string): string[][] {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCsvLine);
}

export async function csvToPDF(csvText: string): Promise<Uint8Array> {
  const rows = parseCsv(csvText);
  if (!rows.length) throw new Error("CSV is empty.");

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 40;
  const fontSize = 9;
  const rowHeight = 14;
  const cols = Math.max(...rows.map((r) => r.length));
  const colWidth = (pageWidth - margin * 2) / Math.max(cols, 1);

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  rows.forEach((row, rowIndex) => {
    if (y < margin + rowHeight) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    row.forEach((cell, colIndex) => {
      const x = margin + colIndex * colWidth;
      page.drawText(cell.slice(0, 48), {
        x,
        y,
        size: fontSize,
        font: rowIndex === 0 ? fontBold : font,
        color: rgb(0.12, 0.12, 0.12),
        maxWidth: colWidth - 4,
      });
    });
    y -= rowHeight;
  });

  return doc.save();
}
