import { PDFDocument, rgb } from "pdf-lib";

function parseHexColor(hex: string): ReturnType<typeof rgb> {
  const raw = hex.replace(/^#/, "").trim();
  const normalized =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error("Invalid hex color. Use formats like #RRGGBB or #RGB.");
  }

  const n = parseInt(normalized, 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Rebuild each page with a solid background color behind the content. */
export async function addBackgroundColor(buffer: ArrayBuffer, hex: string): Promise<Uint8Array> {
  const color = parseHexColor(hex);
  const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const out = await PDFDocument.create();

  for (let i = 0; i < src.getPageCount(); i++) {
    const srcPage = src.getPage(i);
    const { width, height } = srcPage.getSize();
    const embedded = await out.embedPage(srcPage);
    const page = out.addPage([width, height]);

    page.drawRectangle({ x: 0, y: 0, width, height, color });
    page.drawPage(embedded, { x: 0, y: 0, width, height });
  }

  return out.save();
}
