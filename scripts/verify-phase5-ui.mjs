/**
 * Smoke-test Phase 5 tool pages on localhost (dev or production).
 * Usage: node scripts/verify-phase5-ui.mjs [baseUrl]
 */
import puppeteer from "puppeteer";
import { existsSync } from "node:fs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const baseUrl = process.argv[2] ?? "http://localhost:3000";

const ROUTES = [
  { path: "/text-to-pdf", title: "Text to PDF", button: "Create PDF" },
  { path: "/split-by-size", title: "Split PDF by Size", button: "Split by size" },
  { path: "/merge-alternate", title: "Merge Alternate Pages", button: "Merge alternate pages" },
  { path: "/add-links-pdf", title: "Add Links to PDF", button: "Add links" },
  { path: "/auto-rotate-pdf", title: "Auto-Rotate PDF", button: "Auto-rotate pages" },
];

async function makeTestPdf(name, pages = 2) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([400, 500]);
    page.drawText(`${name} page ${i + 1}`, { x: 50, y: 450, size: 14, font, color: rgb(0, 0, 0) });
  }
  return Buffer.from(await doc.save());
}

async function clickButton(page, text) {
  const clicked = await page.evaluate((label) => {
    const btn = [...document.querySelectorAll("button")].find((el) =>
      el.textContent?.includes(label)
    );
    if (!btn) return false;
    btn.click();
    return true;
  }, text);
  if (!clicked) throw new Error(`Button not found: ${label}`);
}

async function waitForText(page, text, timeout = 60_000) {
  await page.waitForFunction(
    (needle) => document.body.innerText.includes(needle),
    { timeout },
    text
  );
}

async function uploadPdf(page, ...paths) {
  const input = await page.$('input[type="file"]');
  if (!input) throw new Error("File input not found");
  await input.uploadFile(...paths);
}

async function main() {
  const dir = join(tmpdir(), "pdfingpro-phase5-test");
  await mkdir(dir, { recursive: true });

  const pdfA = await makeTestPdf("A", 2);
  const pdfB = await makeTestPdf("B", 2);
  const pdfPathA = join(dir, "test-a.pdf");
  const pdfPathB = join(dir, "test-b.pdf");
  await writeFile(pdfPathA, pdfA);
  await writeFile(pdfPathB, pdfB);

  const chromePaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);

  const executablePath = chromePaths.find((p) => existsSync(p));
  const browser = await puppeteer.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(60_000);

  const results = [];

  for (const route of ROUTES) {
    const url = `${baseUrl}${route.path}`;
    try {
      await page.goto(url, { waitUntil: "networkidle0" });
      const heading = await page.$eval("h1", (el) => el.textContent?.trim() ?? "");
      if (!heading.includes(route.title.split(" ")[0])) {
        throw new Error(`Expected heading containing "${route.title}", got "${heading}"`);
      }
      results.push({ route: route.path, status: "page-load", ok: true });
    } catch (err) {
      results.push({ route: route.path, status: "page-load", ok: false, error: err.message });
    }
  }

  // Text to PDF — full flow (no file upload)
  try {
    await page.goto(`${baseUrl}/text-to-pdf`, { waitUntil: "networkidle0" });
    await page.type("textarea", "Phase 5 smoke test\nLine two.");
    await clickButton(page, "Create PDF");
    await waitForText(page, "Done");
    results.push({ route: "/text-to-pdf", status: "convert", ok: true });
  } catch (err) {
    results.push({ route: "/text-to-pdf", status: "convert", ok: false, error: err.message });
  }

  // Add links — upload + convert
  try {
    await page.goto(`${baseUrl}/add-links-pdf`, { waitUntil: "networkidle0" });
    await uploadPdf(page, pdfPathA);
    await waitForText(page, "Link entries");
    await clickButton(page, "Add links");
    await waitForText(page, "Done");
    results.push({ route: "/add-links-pdf", status: "convert", ok: true });
  } catch (err) {
    results.push({ route: "/add-links-pdf", status: "convert", ok: false, error: err.message });
  }

  // Merge alternate — two files
  try {
    await page.goto(`${baseUrl}/merge-alternate`, { waitUntil: "networkidle0" });
    await uploadPdf(page, pdfPathA, pdfPathB);
    await waitForText(page, "Merge alternate pages");
    await clickButton(page, "Merge alternate pages");
    await waitForText(page, "Done");
    results.push({ route: "/merge-alternate", status: "convert", ok: true });
  } catch (err) {
    results.push({ route: "/merge-alternate", status: "convert", ok: false, error: err.message });
  }

  // Auto rotate
  try {
    await page.goto(`${baseUrl}/auto-rotate-pdf`, { waitUntil: "networkidle0" });
    await uploadPdf(page, pdfPathA);
    await waitForText(page, "Auto-rotate pages");
    await clickButton(page, "Auto-rotate pages");
    await waitForText(page, "Done");
    results.push({ route: "/auto-rotate-pdf", status: "convert", ok: true });
  } catch (err) {
    results.push({ route: "/auto-rotate-pdf", status: "convert", ok: false, error: err.message });
  }

  // Split by size — auto-downloads ZIP, shows success card
  try {
    await page.goto(`${baseUrl}/split-by-size`, { waitUntil: "networkidle0" });
    await uploadPdf(page, pdfPathA);
    await waitForText(page, "Maximum file size");
    await clickButton(page, "Split by size");
    await waitForText(page, "Start Over");
    results.push({ route: "/split-by-size", status: "convert", ok: true });
  } catch (err) {
    results.push({ route: "/split-by-size", status: "convert", ok: false, error: err.message });
  }

  await browser.close();

  console.log(JSON.stringify({ baseUrl, results }, null, 2));
  const failed = results.filter((r) => !r.ok);
  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
