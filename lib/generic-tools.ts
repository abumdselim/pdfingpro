import type { ToolCategory } from "@/lib/tools";

export type GenericToolMode =
  | "text-to-pdf"
  | "pdf-download"
  | "pdf-text-download"
  | "pdf-json-download"
  | "pdf-markdown-download"
  | "dual-pdf"
  | "images"
  | "pdf-validate"
  | "pdf-split-zip"
  | "pdf-split-even-odd"
  | "invoice-form"
  | "create-form"
  | "pdf-warnings";

export interface GenericToolConfig {
  mode: GenericToolMode;
  iconClass: string;
  accept?: string;
}

export const GENERIC_TOOL_CONFIG: Record<string, GenericToolConfig> = {
  "csv-to-pdf": { mode: "text-to-pdf", iconClass: "bg-green-50 text-green-600" },
  "pdf-to-csv": { mode: "pdf-text-download", iconClass: "bg-green-50 text-green-700" },
  "pdf-summary": { mode: "pdf-text-download", iconClass: "bg-violet-50 text-violet-600" },
  "create-pdf-form": { mode: "create-form", iconClass: "bg-cyan-50 text-cyan-600" },
  "markdown-to-pdf": { mode: "text-to-pdf", iconClass: "bg-stone-50 text-stone-600" },
  "bmp-to-pdf": { mode: "images", iconClass: "bg-fuchsia-50 text-fuchsia-600", accept: "image/bmp" },
  "gif-to-pdf": { mode: "images", iconClass: "bg-pink-50 text-pink-600", accept: "image/gif" },
  "svg-to-pdf": { mode: "images", iconClass: "bg-indigo-50 text-indigo-800", accept: "image/svg+xml" },
  "insert-pages-pdf": { mode: "dual-pdf", iconClass: "bg-indigo-50 text-indigo-600" },
  "overlay-pdf": { mode: "dual-pdf", iconClass: "bg-teal-50 text-teal-600" },
  "replace-pages-pdf": { mode: "dual-pdf", iconClass: "bg-indigo-50 text-indigo-700" },
  "pdf-to-markdown": { mode: "pdf-markdown-download", iconClass: "bg-stone-50 text-stone-600" },
  "json-to-pdf": { mode: "text-to-pdf", iconClass: "bg-amber-50 text-amber-600" },
  "xml-to-pdf": { mode: "text-to-pdf", iconClass: "bg-orange-50 text-orange-700" },
  "combine-text-pdf": { mode: "images", iconClass: "bg-stone-50 text-stone-700", accept: "text/plain" },
  "add-blank-pages": { mode: "pdf-download", iconClass: "bg-sky-50 text-sky-600" },
  "shuffle-pdf": { mode: "pdf-download", iconClass: "bg-purple-50 text-purple-600" },
  "mirror-pdf": { mode: "pdf-download", iconClass: "bg-rose-50 text-rose-600" },
  "posterize-pdf": { mode: "pdf-download", iconClass: "bg-orange-50 text-orange-600" },
  "fit-to-page-pdf": { mode: "pdf-download", iconClass: "bg-cyan-50 text-cyan-700" },
  "page-labels-pdf": { mode: "pdf-download", iconClass: "bg-blue-50 text-blue-600" },
  "tile-pdf": { mode: "pdf-download", iconClass: "bg-lime-50 text-lime-600" },
  "add-background-pdf": { mode: "pdf-download", iconClass: "bg-emerald-50 text-emerald-600" },
  "linearize-pdf": { mode: "pdf-download", iconClass: "bg-blue-50 text-blue-700" },
  "duplicate-range-pdf": { mode: "pdf-download", iconClass: "bg-pink-50 text-pink-700" },
  "sort-pages-size-pdf": { mode: "pdf-download", iconClass: "bg-violet-50 text-violet-700" },
  "remove-metadata-pdf": { mode: "pdf-download", iconClass: "bg-red-50 text-red-700" },
  "qr-code-pdf": { mode: "pdf-download", iconClass: "bg-neutral-50 text-neutral-700" },
  "pdf-to-json": { mode: "pdf-json-download", iconClass: "bg-yellow-50 text-yellow-700" },
  "export-bookmarks-pdf": { mode: "pdf-json-download", iconClass: "bg-amber-50 text-amber-700" },
  "pdf-validator": { mode: "pdf-validate", iconClass: "bg-slate-50 text-slate-700" },
  "split-even-odd": { mode: "pdf-split-even-odd", iconClass: "bg-rose-50 text-rose-700" },
  "split-every-n-pages": { mode: "pdf-split-zip", iconClass: "bg-rose-50 text-rose-600" },
  "pdf-to-pdfa-3": { mode: "pdf-warnings", iconClass: "bg-slate-50 text-slate-800" },
  "invoice-pdf": { mode: "invoice-form", iconClass: "bg-teal-50 text-teal-700" },
};

export function camelToolId(id: string): string {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
