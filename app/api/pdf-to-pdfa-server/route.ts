import { NextResponse } from "next/server";
import { convertPdfToPdfAOnServer, OfficeToPdfError } from "@/lib/pdf/office-to-pdf-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      throw new OfficeToPdfError("A PDF file is required.", "INVALID_FILE");
    }

    const buffer = await file.arrayBuffer();
    const { bytes, filename } = await convertPdfToPdfAOnServer(
      buffer,
      file.name || "document.pdf"
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
          : "Could not convert this PDF to PDF/A.";

    const status =
      code === "INVALID_FILE" || code === "UNSUPPORTED" || code === "TOO_LARGE" ? 400 : 422;

    return NextResponse.json({ error: message, code }, { status });
  }
}
