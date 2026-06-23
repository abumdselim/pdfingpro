import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(projectRoot, "node_modules", "material-symbols", "material-symbols-outlined.woff2");
const destDir = path.join(projectRoot, "assets", "fonts");
const dest = path.join(destDir, "material-symbols-outlined.woff2");

if (!fs.existsSync(source)) {
  console.warn("[pdfing-pro] material-symbols font not found; run npm install first.");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(source, dest);
console.log("[pdfing-pro] Copied material-symbols-outlined.woff2 to assets/fonts/");
