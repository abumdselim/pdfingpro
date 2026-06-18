import fs from "node:fs";
import type { PaperFormat } from "puppeteer";
import type { UrlToPdfRequest } from "./url-to-pdf-types";
import { URL_TO_PDF_MARGINS } from "./url-to-pdf-types";
import { assertSafePublicUrl, suggestedPdfFilename } from "./url-validation";

const NAVIGATION_TIMEOUT_MS = 45_000;
const SETTLE_MS = 1_500;

function buildInjectedCss(options: UrlToPdfRequest): string {
  const scaleValue = Math.max(0.5, Math.min(1.4, options.scale / 100));
  const fitWidthCss =
    options.fitMode === "fit-width" || options.fitMode === "compact"
      ? `
        *, *::before, *::after { box-sizing: border-box; }
        img, video, canvas, svg, iframe { max-width: 100% !important; height: auto; }
        table { max-width: 100%; border-collapse: collapse; }
        pre, code { white-space: pre-wrap; overflow-wrap: anywhere; }
        body { overflow-wrap: anywhere; }
      `
      : "";
  const compactCss =
    options.fitMode === "compact"
      ? `
        body { line-height: 1.35 !important; }
        p, ul, ol, blockquote, figure { margin-top: 0.55em !important; margin-bottom: 0.55em !important; }
      `
      : "";

  return `
    html, body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      transform: scale(${scaleValue});
      transform-origin: top left;
      width: ${100 / scaleValue}%;
    }
    ${fitWidthCss}
    ${compactCss}
  `;
}

function marginInches(margin: UrlToPdfRequest["margin"]) {
  const value = URL_TO_PDF_MARGINS[margin];
  return { top: value, right: value, bottom: value, left: value };
}

let browserPromise: Promise<import("puppeteer").Browser> | null = null;

function findSystemChromeExecutable(): string | undefined {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ].filter((value): value is string => Boolean(value));

  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function getBrowser() {
  if (!browserPromise) {
    const puppeteer = await import("puppeteer");
    const launchOptions: import("puppeteer").LaunchOptions = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    };

    const systemChrome = findSystemChromeExecutable();
    if (systemChrome) {
      launchOptions.executablePath = systemChrome;
    }

    try {
      browserPromise = puppeteer.default.launch(launchOptions);
      await browserPromise;
    } catch (error: unknown) {
      browserPromise = null;
      const message = (error as Error)?.message ?? "Could not launch headless Chrome.";
      if (/Could not find Chrome/i.test(message)) {
        throw new UrlToPdfError(
          "BROWSER_MISSING",
          "Headless Chrome is not installed. Run: npx puppeteer browsers install chrome"
        );
      }
      throw new UrlToPdfError("RENDER_FAILED", message);
    }
  }
  return browserPromise;
}

export class UrlToPdfError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "UrlToPdfError";
  }
}

export async function renderUrlToPdf(options: UrlToPdfRequest): Promise<{
  bytes: Uint8Array;
  filename: string;
}> {
  const safeUrl = await assertSafePublicUrl(options.url).catch((error: unknown) => {
    throw new UrlToPdfError("INVALID_URL", (error as Error).message);
  });

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 1 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PdfingPro/1.0"
    );

    const response = await page.goto(safeUrl.toString(), {
      waitUntil: "networkidle2",
      timeout: NAVIGATION_TIMEOUT_MS,
    }).catch(async () => {
      return page.goto(safeUrl.toString(), {
        waitUntil: "domcontentloaded",
        timeout: NAVIGATION_TIMEOUT_MS,
      });
    });

    if (!response) {
      throw new UrlToPdfError("RENDER_FAILED", "The website did not respond.");
    }

    const status = response.status();
    if (status === 401 || status === 403) {
      throw new UrlToPdfError(
        "UNSUPPORTED",
        "This page requires login or blocks automated access. Use your browser while signed in, then save as PDF manually."
      );
    }
    if (status >= 400) {
      throw new UrlToPdfError(
        "FETCH_FAILED",
        `The website returned an error (${status}). It may block automated access.`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));
    await page.addStyleTag({ content: buildInjectedCss(options) });

    const pdfBuffer = await page.pdf({
      format: options.pageSize as PaperFormat,
      landscape: options.orientation === "landscape",
      margin: marginInches(options.margin),
      printBackground: true,
      preferCSSPageSize: false,
    });

    return {
      bytes: new Uint8Array(pdfBuffer),
      filename: suggestedPdfFilename(safeUrl),
    };
  } catch (error: unknown) {
    if (error instanceof UrlToPdfError) {
      throw error;
    }

    const message = (error as Error)?.message ?? "Could not convert this website to PDF.";
    if (/timeout/i.test(message)) {
      throw new UrlToPdfError("TIMEOUT", "The website took too long to load.");
    }
    if (/net::ERR/i.test(message)) {
      throw new UrlToPdfError("FETCH_FAILED", "Could not reach the website.");
    }

    throw new UrlToPdfError("RENDER_FAILED", message);
  } finally {
    await page.close();
  }
}
