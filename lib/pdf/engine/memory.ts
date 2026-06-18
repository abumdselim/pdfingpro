import type { AdaptiveProfile, EngineTier } from "./types";

/** Pause so the main thread can paint and handle input. */
export function yieldToMain(ms = 0): Promise<void> {
  return new Promise((resolve) => {
    if (ms > 0) {
      setTimeout(resolve, ms);
      return;
    }
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

/** Drop canvas backing store to free GPU/RAM memory. */
export function releaseCanvas(canvas: HTMLCanvasElement | OffscreenCanvas | null | undefined) {
  if (!canvas) return;
  try {
    canvas.width = 0;
    canvas.height = 0;
  } catch {
    // ignore
  }
}

/** Encode canvas to bytes without base64 data-URL overhead. */
export function canvasToBytes(
  canvas: HTMLCanvasElement,
  mime: "image/jpeg" | "image/png",
  quality?: number
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode canvas."));
          return;
        }
        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      mime,
      quality
    );
  });
}

export function getAdaptiveProfile(byteLength: number, pageCount: number): AdaptiveProfile {
  const mb = byteLength / (1024 * 1024);
  const pages = Math.max(1, pageCount);

  let tier: EngineTier = "normal";
  let thumbnailScale = 0.35;
  let renderScale = 1.5;
  let yieldMs = 0;
  let thumbnailPauseMs = 0;

  if (mb > 40 || pages > 80) {
    tier = "large";
    thumbnailScale = 0.26;
    renderScale = 1.25;
    yieldMs = 8;
    thumbnailPauseMs = 12;
  }
  if (mb > 120 || pages > 200) {
    tier = "xlarge";
    thumbnailScale = 0.2;
    renderScale = 1.05;
    yieldMs = 16;
    thumbnailPauseMs = 24;
  }
  if (mb > 300 || pages > 400) {
    tier = "extreme";
    thumbnailScale = 0.15;
    renderScale = 0.9;
    yieldMs = 24;
    thumbnailPauseMs = 40;
  }

  return { tier, thumbnailScale, renderScale, yieldMs, thumbnailPauseMs };
}

/** Rough working-set estimate for UI messaging (not a hard limit). */
export function estimateWorkingSetMb(byteLength: number, pageCount: number, scale = 1.5): number {
  const fileMb = byteLength / (1024 * 1024);
  const pageSurfaceMb = (pageCount * 1200 * 1600 * 4 * scale * scale) / (1024 * 1024);
  return fileMb + pageSurfaceMb * 0.15;
}
