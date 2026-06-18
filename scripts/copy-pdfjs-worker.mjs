import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(projectRoot, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const destDir = path.join(projectRoot, "public", "pdfjs");
const dest = path.join(destDir, "pdf.worker.min.mjs");

if (!fs.existsSync(source)) {
  console.warn("[pdfing-pro] pdfjs worker source not found; run npm install first.");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(source, dest);
console.log("[pdfing-pro] Copied pdf.worker.min.mjs to public/pdfjs/");
