import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = path.join(projectRoot, "public", "icons", "icon.svg");
const outDir = path.join(projectRoot, "public", "icons");

const SIZES = [192, 512];

async function main() {
  if (!fs.existsSync(svgPath)) {
    console.warn("[pdfing-pro] icon.svg not found; skipping PWA icon generation.");
    return;
  }

  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("[pdfing-pro] sharp not installed; run npm install to generate PWA icons.");
    return;
  }

  fs.mkdirSync(outDir, { recursive: true });
  const svg = fs.readFileSync(svgPath);

  for (const size of SIZES) {
    const dest = path.join(outDir, `icon-${size}x${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(dest);
    console.log(`[pdfing-pro] Generated ${path.relative(projectRoot, dest)}`);
  }
}

main().catch((err) => {
  console.error("[pdfing-pro] PWA icon generation failed:", err);
  process.exit(1);
});
