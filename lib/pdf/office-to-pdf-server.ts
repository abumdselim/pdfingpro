import path from "node:path";
import { createWorkerConverter, type WorkerConverter } from "@matbee/libreoffice-converter/server";

export type OfficeInputFormat = "docx" | "pptx" | "xlsx";

export class OfficeToPdfError extends Error {
  constructor(
    message: string,
    readonly code: "INVALID_FILE" | "UNSUPPORTED" | "CONVERT_FAILED" | "TOO_LARGE"
  ) {
    super(message);
    this.name = "OfficeToPdfError";
  }
}

const MAX_BYTES = 25 * 1024 * 1024;

const EXTENSIONS: Record<OfficeInputFormat, Set<string>> = {
  docx: new Set([".docx", ".doc"]),
  pptx: new Set([".pptx", ".ppt"]),
  xlsx: new Set([".xlsx", ".xls"]),
};

let converterPromise: Promise<WorkerConverter> | null = null;

function wasmPath(): string {
  return path.join(process.cwd(), "node_modules/@matbee/libreoffice-converter/wasm");
}

async function getConverter(): Promise<WorkerConverter> {
  if (!converterPromise) {
    converterPromise = createWorkerConverter({ wasmPath: wasmPath(), verbose: false });
  }
  return converterPromise;
}

export function assertOfficeFile(
  filename: string,
  format: OfficeInputFormat,
  byteLength: number
): void {
  if (byteLength <= 0) {
    throw new OfficeToPdfError("The uploaded file is empty.", "INVALID_FILE");
  }
  if (byteLength > MAX_BYTES) {
    throw new OfficeToPdfError("File exceeds the 25 MB limit.", "TOO_LARGE");
  }

  const ext = path.extname(filename).toLowerCase();
  if (!EXTENSIONS[format].has(ext)) {
    throw new OfficeToPdfError(`Expected a ${format.toUpperCase()} file.`, "UNSUPPORTED");
  }
}

export async function convertOfficeToPdf(
  buffer: ArrayBuffer,
  format: OfficeInputFormat,
  filename: string
): Promise<{ bytes: Uint8Array; filename: string }> {
  assertOfficeFile(filename, format, buffer.byteLength);

  const converter = await getConverter();
  const result = await converter.convert(
    new Uint8Array(buffer),
    { outputFormat: "pdf", inputFormat: format },
    filename
  );

  const base = path.basename(filename, path.extname(filename)) || "document";
  return {
    bytes: new Uint8Array(result.data),
    filename: `${base}.pdf`,
  };
}

export async function convertPdfToPdfAOnServer(
  buffer: ArrayBuffer,
  filename: string
): Promise<{ bytes: Uint8Array; filename: string }> {
  if (buffer.byteLength <= 0) {
    throw new OfficeToPdfError("The uploaded file is empty.", "INVALID_FILE");
  }
  if (buffer.byteLength > MAX_BYTES) {
    throw new OfficeToPdfError("File exceeds the 25 MB limit.", "TOO_LARGE");
  }
  if (path.extname(filename).toLowerCase() !== ".pdf") {
    throw new OfficeToPdfError("Expected a PDF file.", "UNSUPPORTED");
  }

  const converter = await getConverter();
  const result = await converter.convert(
    new Uint8Array(buffer),
    {
      outputFormat: "pdf",
      inputFormat: "pdf",
      pdf: { pdfaLevel: "PDF/A-2b" },
    },
    filename
  );

  const base = path.basename(filename, path.extname(filename)) || "document";
  return {
    bytes: new Uint8Array(result.data),
    filename: `${base}-pdfa-2b.pdf`,
  };
}
