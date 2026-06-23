import { NextResponse } from "next/server";
import {
  convertOfficeToPdf,
  OfficeToPdfError,
  type OfficeInputFormat,
} from "@/lib/pdf/office-to-pdf-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const FORMATS = new Set<OfficeInputFormat>(["docx", "pptx", "xlsx"]);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const format = form.get("format");

    if (!(file instanceof File)) {
      throw new OfficeToPdfError("A document file is required.", "INVALID_FILE");
    }
    if (typeof format !== "string" || !FORMATS.has(format as OfficeInputFormat)) {
      throw new OfficeToPdfError("Unsupported conversion format.", "UNSUPPORTED");
    }

    const buffer = await file.arrayBuffer();
    const { bytes, filename } = await convertOfficeToPdf(
      buffer,
      format as OfficeInputFormat,
      file.name || `document.${format}`
    );

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const code = error instanceof OfficeToPdfError ? error.code : "CONVERT_FAILED";
    const message =
      error instanceof OfficeToPdfError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Could not convert this document to PDF.";

    const status =
      code === "INVALID_FILE" || code === "UNSUPPORTED" || code === "TOO_LARGE" ? 400 : 422;

    return NextResponse.json({ error: message, code }, { status });
  }
}
