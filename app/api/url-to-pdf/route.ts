import { NextResponse } from "next/server";
import type { UrlToPdfRequest } from "@/lib/pdf/url-to-pdf-types";
import { renderUrlToPdf, UrlToPdfError } from "@/lib/pdf/url-to-pdf-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function parseRequest(body: unknown): UrlToPdfRequest {
  if (!body || typeof body !== "object") {
    throw new UrlToPdfError("INVALID_REQUEST", "Invalid request body.");
  }

  const value = body as Partial<UrlToPdfRequest>;
  if (!value.url || typeof value.url !== "string") {
    throw new UrlToPdfError("INVALID_REQUEST", "A website URL is required.");
  }

  const pageSizes = new Set(["Letter", "A4", "Legal"]);
  const margins = new Set(["none", "small", "normal", "wide"]);
  const fitModes = new Set(["natural", "fit-width", "compact"]);

  return {
    url: value.url,
    pageSize: pageSizes.has(value.pageSize as UrlToPdfRequest["pageSize"])
      ? (value.pageSize as UrlToPdfRequest["pageSize"])
      : "A4",
    orientation: value.orientation === "landscape" ? "landscape" : "portrait",
    margin: margins.has(value.margin as UrlToPdfRequest["margin"])
      ? (value.margin as UrlToPdfRequest["margin"])
      : "normal",
    scale:
      typeof value.scale === "number" && value.scale >= 50 && value.scale <= 140
        ? value.scale
        : 100,
    fitMode: fitModes.has(value.fitMode as UrlToPdfRequest["fitMode"])
      ? (value.fitMode as UrlToPdfRequest["fitMode"])
      : "fit-width",
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const options = parseRequest(body);
    const { bytes, filename } = await renderUrlToPdf(options);

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const code = error instanceof UrlToPdfError ? error.code : "RENDER_FAILED";
    const message =
      error instanceof UrlToPdfError
        ? error.message
        : "Could not convert this website to PDF.";

    const status =
      code === "INVALID_URL" || code === "INVALID_REQUEST"
        ? 400
        : code === "UNSUPPORTED"
          ? 422
          : 422;

    return NextResponse.json({ error: message, code }, { status });
  }
}
