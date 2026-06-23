import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface FormFieldSpec {
  name: string;
  label: string;
}

export function parseFormFieldLines(input: string): FormFieldSpec[] | null {
  const lines = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return null;

  const fields: FormFieldSpec[] = [];
  for (const line of lines) {
    const [name, label] = line.split("|").map((p) => p.trim());
    if (!name) return null;
    fields.push({ name, label: label || name });
  }
  return fields;
}

export async function createPdfForm(fields: FormFieldSpec[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 56;
  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  page.drawText("Form", { x: margin, y, size: 18, font, color: rgb(0.1, 0.1, 0.1) });
  y -= 36;

  for (const field of fields) {
    if (y < margin + 50) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    page.drawText(field.label, { x: margin, y, size: 11, font, color: rgb(0.2, 0.2, 0.2) });
    y -= 16;
    const textField = form.createTextField(field.name);
    textField.addToPage(page, { x: margin, y: y - 4, width: pageWidth - margin * 2, height: 22 });
    y -= 44;
  }

  return doc.save();
}
