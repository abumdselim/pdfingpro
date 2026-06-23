import { PDFDocument, PDFName, rgb } from "pdf-lib";

export type PageSizePreset = "a4" | "letter" | "legal";
export type ResizeMode = "fit" | "fill";

export const PAGE_SIZE_PT: Record<PageSizePreset, { width: number; height: number; label: string }> = {
  a4: { width: 595.28, height: 841.89, label: "A4" },
  letter: { width: 612, height: 792, label: "Letter" },
  legal: { width: 612, height: 1008, label: "Legal" },
};

function ensurePageContents(page: ReturnType<PDFDocument["getPage"]>) {
  if (page.node.lookup(PDFName.of("Contents"))) return;
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
}

/** Scale each page to fit or fill a standard paper size. */
export async function resizePdfToPreset(
  buffer: ArrayBuffer,
  preset: PageSizePreset,
  mode: ResizeMode = "fit"
): Promise<Uint8Array> {
  const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const target = PAGE_SIZE_PT[preset];

  for (let i = 0; i < src.getPageCount(); i++) {
    const srcPage = src.getPage(i);
    ensurePageContents(srcPage);
    const { width: sw, height: sh } = srcPage.getSize();
    const scaleX = target.width / sw;
    const scaleY = target.height / sh;
    const scale = mode === "fit" ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);
    const drawW = sw * scale;
    const drawH = sh * scale;
    const x = (target.width - drawW) / 2;
    const y = (target.height - drawH) / 2;

    const embedded = await out.embedPage(srcPage);
    const page = out.addPage([target.width, target.height]);
    page.drawPage(embedded, { x, y, width: drawW, height: drawH });
  }

  return out.save();
}
