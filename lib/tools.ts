import { withDarkIcon } from "@/lib/theme/ui";

export interface Tool {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  href: string;
  category: ToolCategory;
  color: string; // Tailwind icon container — light + dark pairs
}

function icon(light: string) {
  return withDarkIcon(light);
}

export type ToolCategory = "organize" | "convert" | "edit" | "security";

export const TOOLS: Tool[] = [
  // Organize
  {
    id: "merge-pdf",
    titleKey: "tools.mergePdf.title",
    descriptionKey: "tools.mergePdf.description",
    icon: "merge",
    href: "/merge-pdf",
    category: "organize",
    color: icon("bg-indigo-50 text-indigo-600"),
  },
  {
    id: "split-pdf",
    titleKey: "tools.splitPdf.title",
    descriptionKey: "tools.splitPdf.description",
    icon: "cut",
    href: "/split-pdf",
    category: "organize",
    color: icon("bg-rose-50 text-rose-600"),
  },
  {
    id: "organize-pdf",
    titleKey: "tools.organizePdf.title",
    descriptionKey: "tools.organizePdf.description",
    icon: "grid_view",
    href: "/organize-pdf",
    category: "organize",
    color: icon("bg-amber-50 text-amber-600"),
  },
  {
    id: "add-page-numbers",
    titleKey: "tools.addPageNumbers.title",
    descriptionKey: "tools.addPageNumbers.description",
    icon: "format_list_numbered",
    href: "/add-page-numbers",
    category: "organize",
    color: icon("bg-sky-50 text-sky-600"),
  },
  // Convert
  {
    id: "pdf-to-jpg",
    titleKey: "tools.pdfToJpg.title",
    descriptionKey: "tools.pdfToJpg.description",
    icon: "image",
    href: "/pdf-to-jpg",
    category: "convert",
    color: icon("bg-orange-50 text-orange-600"),
  },
  {
    id: "jpg-to-pdf",
    titleKey: "tools.jpgToPdf.title",
    descriptionKey: "tools.jpgToPdf.description",
    icon: "add_photo_alternate",
    href: "/jpg-to-pdf",
    category: "convert",
    color: icon("bg-fuchsia-50 text-fuchsia-600"),
  },
  {
    id: "pdf-to-word",
    titleKey: "tools.pdfToWord.title",
    descriptionKey: "tools.pdfToWord.description",
    icon: "description",
    href: "/pdf-to-word",
    category: "convert",
    color: icon("bg-blue-50 text-blue-600"),
  },
  {
    id: "website-to-pdf",
    titleKey: "tools.websiteToPdf.title",
    descriptionKey: "tools.websiteToPdf.description",
    icon: "language",
    href: "/website-to-pdf",
    category: "convert",
    color: icon("bg-stone-50 text-stone-600"),
  },
  // Edit
  {
    id: "compress-pdf",
    titleKey: "tools.compressPdf.title",
    descriptionKey: "tools.compressPdf.description",
    icon: "compress",
    href: "/compress-pdf",
    category: "edit",
    color: icon("bg-emerald-50 text-emerald-600"),
  },
  {
    id: "rotate-pdf",
    titleKey: "tools.rotatePdf.title",
    descriptionKey: "tools.rotatePdf.description",
    icon: "rotate_right",
    href: "/rotate-pdf",
    category: "edit",
    color: icon("bg-purple-50 text-purple-600"),
  },
  {
    id: "watermark-pdf",
    titleKey: "tools.watermarkPdf.title",
    descriptionKey: "tools.watermarkPdf.description",
    icon: "water",
    href: "/watermark-pdf",
    category: "edit",
    color: icon("bg-cyan-50 text-cyan-600"),
  },
  {
    id: "sign-pdf",
    titleKey: "tools.signPdf.title",
    descriptionKey: "tools.signPdf.description",
    icon: "draw",
    href: "/sign-pdf",
    category: "edit",
    color: icon("bg-pink-50 text-pink-600"),
  },
  {
    id: "highlight-pdf",
    titleKey: "tools.highlightPdf.title",
    descriptionKey: "tools.highlightPdf.description",
    icon: "draw",
    href: "/highlight-pdf",
    category: "edit",
    color: icon("bg-yellow-50 text-yellow-600"),
  },
  {
    id: "stamp-pdf",
    titleKey: "tools.stampPdf.title",
    descriptionKey: "tools.stampPdf.description",
    icon: "approval",
    href: "/stamp-pdf",
    category: "edit",
    color: icon("bg-teal-50 text-teal-600"),
  },
  {
    id: "crop-pdf",
    titleKey: "tools.cropPdf.title",
    descriptionKey: "tools.cropPdf.description",
    icon: "crop",
    href: "/crop-pdf",
    category: "edit",
    color: icon("bg-lime-50 text-lime-600"),
  },
  {
    id: "add-padding-pdf",
    titleKey: "tools.addPaddingPdf.title",
    descriptionKey: "tools.addPaddingPdf.description",
    icon: "border_outer",
    href: "/add-padding-pdf",
    category: "edit",
    color: icon("bg-slate-100 text-slate-700"),
  },
  {
    id: "ocr-pdf",
    titleKey: "tools.ocrPdf.title",
    descriptionKey: "tools.ocrPdf.description",
    icon: "document_scanner",
    href: "/ocr-pdf",
    category: "edit",
    color: icon("bg-violet-50 text-violet-600"),
  },
  // Security
  {
    id: "protect-pdf",
    titleKey: "tools.protectPdf.title",
    descriptionKey: "tools.protectPdf.description",
    icon: "lock",
    href: "/protect-pdf",
    category: "security",
    color: icon("bg-red-50 text-red-600"),
  },
  {
    id: "unlock-pdf",
    titleKey: "tools.unlockPdf.title",
    descriptionKey: "tools.unlockPdf.description",
    icon: "lock_open",
    href: "/unlock-pdf",
    category: "security",
    color: icon("bg-green-50 text-green-600"),
  },
];

export const CATEGORY_KEYS: { id: ToolCategory | "all"; labelKey: string }[] = [
  { id: "all", labelKey: "categories.all" },
  { id: "organize", labelKey: "categories.organize" },
  { id: "convert", labelKey: "categories.convert" },
  { id: "edit", labelKey: "categories.edit" },
  { id: "security", labelKey: "categories.security" },
];

// Keep backward-compatible export name
export const CATEGORIES = CATEGORY_KEYS;
