/**
 * Smoke-test Sign, Highlight, and Organize tool pages in a mobile viewport.
 * Requires dev server: npm run dev (default http://localhost:3000)
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { PDFDocument, StandardFonts } from "pdf-lib";

const BASE_URL = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createTempPdf(pageCount = 3) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pageCount; i += 1) {
    const page = doc.addPage([612, 792]);
    page.drawText(`Smoke test page ${i + 1}`, { x: 72, y: 720, size: 18, font });
  }
  const bytes = await doc.save();
  const tmp = path.join(os.tmpdir(), `pdfing-smoke-${Date.now()}.pdf`);
  fs.writeFileSync(tmp, bytes);
  return tmp;
}

const TOOLS = [
  { name: "Sign PDF", path: "/sign-pdf", expectPageJump: true, expectReorder: false },
  { name: "Highlight PDF", path: "/highlight-pdf", expectPageJump: true, expectReorder: false },
  { name: "Organize PDF", path: "/organize-pdf", expectPageJump: false, expectReorder: true },
  { name: "Stamp PDF (reference)", path: "/stamp-pdf", expectPageJump: true, expectReorder: false },
];

async function waitForServer(page) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      const res = await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 8000 });
      if (res && res.ok()) return;
    } catch {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw new Error(`Dev server not reachable at ${BASE_URL}. Run: npm run dev`);
}

async function uploadPdf(page, pdfPath) {
  const input = await page.waitForSelector('input[type="file"]', { timeout: 15000 });
  await input.uploadFile(pdfPath);
}

async function run() {
  const pdfPath = await createTempPdf(3);
  const browser = await puppeteer.launch({
    headless: true,
    channel: "chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.emulate({
    name: "iPhone 14",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  });

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "maxTouchPoints", { get: () => 5, configurable: true });
    Object.defineProperty(window, "ontouchstart", { value: null, configurable: true, writable: true });
  });

  await waitForServer(page);

  const results = [];

  for (const tool of TOOLS) {
    const entry = { tool: tool.name, path: tool.path, pass: true, details: [] };

    try {
      const response = await page.goto(`${BASE_URL}${tool.path}`, {
        waitUntil: "networkidle2",
        timeout: 90000,
      });

      if (!response?.ok()) {
        entry.pass = false;
        entry.details.push(`HTTP ${response?.status() ?? "failed"}`);
        results.push(entry);
        continue;
      }

      await page.waitForSelector("h1", { timeout: 20000 });
      await uploadPdf(page, pdfPath);

      if (tool.expectPageJump) {
        await page.waitForSelector('button[aria-label="Jump to page"]', { timeout: 30000 });
        entry.details.push("PageJumpInput: visible after upload");
      }

      if (tool.path !== "/organize-pdf") {
        await page.waitForSelector('[role="status"]', { timeout: 30000 });
        entry.details.push("TouchHint: visible after upload");
      } else {
        await page.waitForSelector('[role="status"]', { timeout: 45000 });
        entry.details.push("TouchHint: visible after thumbnails load");
      }

      if (tool.expectReorder) {
        await page.waitForFunction(
          () => document.querySelectorAll('[aria-label="Move page up"]').length >= 3,
          { timeout: 90000 }
        );
        const upCount = await page.$$eval('[aria-label="Move page up"]', (els) => els.length);
        entry.details.push(`Reorder ↑ buttons: ${upCount}`);
        if (upCount < 2) {
          entry.pass = false;
          entry.details.push("Expected multiple reorder buttons");
        }
      }

      const bodyText = await page.evaluate(() => document.body.innerText);
      if (/Server Error|Cannot find module/i.test(bodyText)) {
        entry.pass = false;
        entry.details.push("Server error on page");
      }

      const canvasCount = await page.$$eval("canvas", (els) => els.length);
      entry.details.push(`Canvas elements: ${canvasCount}`);

      if (tool.path === "/organize-pdf") {
        const imgs = await page.$$eval("img[alt^='Page']", (els) => els.length);
        entry.details.push(`Page thumbnails rendered: ${imgs}`);
        if (imgs < 1) {
          entry.pass = false;
          entry.details.push("No thumbnails after upload");
        }
      }
    } catch (err) {
      entry.pass = false;
      entry.details.push((err instanceof Error ? err.message : String(err)).slice(0, 160));
    }

    results.push(entry);
  }

  await browser.close();
  fs.unlinkSync(pdfPath);

  console.log("\n=== Touch Tools Smoke Test (mobile viewport) ===\n");
  let failed = 0;
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.tool} (${r.path})`);
    for (const d of r.details) console.log(`      · ${d}`);
    if (!r.pass) failed += 1;
  }
  console.log(`\n${results.length - failed}/${results.length} passed\n`);

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
