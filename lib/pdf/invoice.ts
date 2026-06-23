import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceFields {
  invoiceNumber?: string;
  date?: string;
  dueDate?: string;
  fromName?: string;
  fromAddress?: string;
  toName?: string;
  toAddress?: string;
  items?: InvoiceLineItem[];
  notes?: string;
  taxRate?: number;
}

/** Generate a simple invoice PDF from structured fields. */
export async function createInvoicePdf(fields: InvoiceFields): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 48;
  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const draw = (text: string, opts: { bold?: boolean; size?: number } = {}) => {
    const size = opts.size ?? 11;
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: opts.bold ? fontBold : font,
      color: rgb(0.12, 0.12, 0.12),
    });
    y -= size + 6;
  };

  draw("INVOICE", { bold: true, size: 22 });
  y -= 8;

  if (fields.invoiceNumber) draw(`Invoice #: ${fields.invoiceNumber}`);
  if (fields.date) draw(`Date: ${fields.date}`);
  if (fields.dueDate) draw(`Due: ${fields.dueDate}`);
  y -= 10;

  if (fields.fromName) draw(`From: ${fields.fromName}`, { bold: true });
  if (fields.fromAddress) draw(fields.fromAddress);
  y -= 6;

  if (fields.toName) draw(`Bill To: ${fields.toName}`, { bold: true });
  if (fields.toAddress) draw(fields.toAddress);
  y -= 14;

  draw("Description", { bold: true });
  const items = fields.items ?? [];
  let subtotal = 0;

  for (const item of items) {
    const lineTotal = item.quantity * item.unitPrice;
    subtotal += lineTotal;
    const label = `${item.description}  ×${item.quantity}  @ ${item.unitPrice.toFixed(2)}  = ${lineTotal.toFixed(2)}`;
    if (y < margin + 80) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    draw(label);
  }

  y -= 10;
  const taxRate = fields.taxRate ?? 0;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  draw(`Subtotal: ${subtotal.toFixed(2)}`);
  if (taxRate > 0) draw(`Tax (${(taxRate * 100).toFixed(1)}%): ${tax.toFixed(2)}`);
  draw(`Total: ${total.toFixed(2)}`, { bold: true, size: 13 });

  if (fields.notes?.trim()) {
    y -= 16;
    draw("Notes", { bold: true });
    draw(fields.notes.trim());
  }

  return doc.save();
}
