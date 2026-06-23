import { PDFDocument, degrees } from "pdf-lib";

export type AutoRotateMode = "portrait" | "landscape";

function effectiveSize(width: number, height: number, rotation: number) {
  const normalized = ((rotation % 360) + 360) % 360;
  if (normalized === 90 || normalized === 270) {
    return { width: height, height: width };
  }
  return { width, height };
}

/**
 * Rotate pages so they match the target orientation based on current dimensions.
 */
export async function autoRotatePDF(
  arrayBuffer: ArrayBuffer,
  mode: AutoRotateMode = "portrait"
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle;
    const effective = effectiveSize(width, height, rotation);
    const isLandscape = effective.width > effective.height;

    if (mode === "portrait" && isLandscape) {
      page.setRotation(degrees((rotation + 90) % 360));
    } else if (mode === "landscape" && !isLandscape) {
      page.setRotation(degrees((rotation + 90) % 360));
    }
  }

  return doc.save();
}

export function countAutoRotatedPages(
  pages: { width: number; height: number; rotation: number }[],
  mode: AutoRotateMode
): number {
  return pages.filter(({ width, height, rotation }) => {
    const effective = effectiveSize(width, height, rotation);
    const isLandscape = effective.width > effective.height;
    return mode === "portrait" ? isLandscape : !isLandscape;
  }).length;
}
