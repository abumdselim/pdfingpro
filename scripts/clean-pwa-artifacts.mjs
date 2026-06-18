import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(projectRoot, "public");

const PWA_ARTIFACTS = [
  "sw.js",
  "sw.js.map",
  "workbox-f1770938.js",
  "workbox-f1770938.js.map",
  "swe-worker-5c72df51bb1f6ee0.js",
  "swe-worker-5c72df51bb1f6ee0.js.map",
];

function removeIfExists(filePath) {
  if (!fs.existsSync(filePath)) return;
  fs.unlinkSync(filePath);
  console.log(`[pdfing-pro] Removed ${path.relative(projectRoot, filePath)}`);
}

if (process.env.NODE_ENV === "production") {
  process.exit(0);
}

for (const name of PWA_ARTIFACTS) {
  removeIfExists(path.join(publicDir, name));
}

for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (/^(sw|workbox|swe-worker)-.*\.(js|map)$/.test(entry.name)) {
    removeIfExists(path.join(publicDir, entry.name));
  }
}
