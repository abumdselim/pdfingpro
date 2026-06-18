import { spawnSync } from "node:child_process";

const result = spawnSync(
  process.execPath,
  ["./node_modules/puppeteer/install.mjs"],
  { stdio: "inherit", shell: false }
);

if (result.status !== 0) {
  console.warn(
    "[pdfing-pro] Puppeteer browser install skipped or failed. Website-to-PDF requires Chrome: npx puppeteer browsers install chrome"
  );
}
