import type { ComponentType } from "react";
import MotionWrap, { type CardMotionProps } from "@/components/home/card-motions/MotionWrap";
import { MiniDoc, MiniImage, MiniPage } from "@/components/home/card-motions/shared";

export function MergeMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="ctm-merge-unify absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[72%]" />
      </div>
      <div className="ctm-merge-left absolute inset-0 flex items-end justify-start pb-1">
        <MiniPage className="h-[58%] w-[46%]" />
      </div>
      <div className="ctm-merge-right absolute inset-0 flex items-end justify-end pb-1">
        <MiniPage className="h-[58%] w-[46%]" />
      </div>
      <div className="ctm-merge-icon absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
        <span className="material-symbols-outlined text-[18px] icon-filled opacity-50">merge</span>
      </div>
    </MotionWrap>
  );
}

export function SplitMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="ctm-split-left relative h-[68%] w-[38%] overflow-hidden">
          <MiniPage className="absolute right-0 h-full" />
        </div>
        <div className="ctm-split-gap mx-0.5 h-[50%] w-px bg-current opacity-30" />
        <div className="ctm-split-right relative h-[68%] w-[38%] overflow-hidden">
          <MiniPage className="absolute left-0 h-full" />
        </div>
      </div>
      <div className="ctm-split-icon absolute left-1/2 top-[18%] -translate-x-1/2">
        <span className="material-symbols-outlined text-[16px] icon-filled opacity-45">cut</span>
      </div>
    </MotionWrap>
  );
}

export function OrganizeMotion(props: CardMotionProps) {
  const tiles = ["ctm-org-1", "ctm-org-2", "ctm-org-3", "ctm-org-4"];
  const pos = [
    "left-[8%] top-[18%]",
    "right-[8%] top-[18%]",
    "left-[8%] bottom-[12%]",
    "right-[8%] bottom-[12%]",
  ];
  return (
    <MotionWrap {...props}>
      {tiles.map((cls, i) => (
        <div key={cls} className={`absolute h-[28%] w-[32%] ${pos[i]} ${cls}`}>
          <svg viewBox="0 0 32 40" className="h-full w-full" aria-hidden>
            <rect x="1" y="1" width="30" height="38" rx="3" className="fill-current opacity-35" />
            <rect x="5" y="8" width="14" height="2" rx="1" className="fill-current opacity-30" />
            <rect x="5" y="14" width="20" height="1.5" rx="0.75" className="fill-current opacity-22" />
          </svg>
        </div>
      ))}
    </MotionWrap>
  );
}

export function PageNumbersMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[72%]" />
      </div>
      {(["ctm-num-1", "ctm-num-2", "ctm-num-3"] as const).map((cls, i) => (
        <span
          key={cls}
          className={`absolute bottom-[14%] text-[11px] font-extrabold opacity-0 ${cls}`}
          style={{ left: `${28 + i * 22}%` }}
        >
          {i + 1}
        </span>
      ))}
    </MotionWrap>
  );
}

export function PdfToJpgMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="ctm-p2j-pdf absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[68%]" />
      </div>
      <div className="ctm-p2j-img absolute inset-0 flex items-center justify-center opacity-0">
        <MiniImage className="h-[62%]" />
      </div>
      <div className="ctm-p2j-arrow absolute left-1/2 top-[12%] -translate-x-1/2">
        <span className="material-symbols-outlined text-[14px] opacity-40">arrow_downward</span>
      </div>
    </MotionWrap>
  );
}

export function JpgToPdfMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="ctm-j2p-pdf absolute inset-0 flex items-center justify-center opacity-0">
        <MiniPage className="h-[70%]" />
      </div>
      <div className="ctm-j2p-left absolute left-[6%] top-[28%] h-[32%] w-[32%]">
        <MiniImage className="h-full" />
      </div>
      <div className="ctm-j2p-right absolute right-[6%] top-[28%] h-[32%] w-[32%]">
        <MiniImage className="h-full" />
      </div>
    </MotionWrap>
  );
}

export function PdfToWordMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="ctm-p2w-pdf absolute left-[4%] bottom-[10%] h-[58%]">
        <MiniPage className="h-full" />
      </div>
      <div className="ctm-p2w-doc absolute right-[4%] bottom-[10%] h-[58%] opacity-0">
        <MiniDoc className="h-full" />
      </div>
      <div className="ctm-p2w-flow absolute left-1/2 top-[38%] -translate-x-1/2">
        <span className="material-symbols-outlined text-[16px] opacity-40">arrow_forward</span>
      </div>
    </MotionWrap>
  );
}

export function WebsiteToPdfMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="ctm-web-browser absolute left-[10%] top-[16%] h-[42%] w-[44%]">
        <svg viewBox="0 0 52 36" className="h-full w-full" aria-hidden>
          <rect x="1" y="1" width="50" height="34" rx="4" className="fill-current opacity-30" />
          <rect x="1" y="1" width="50" height="8" rx="4" className="fill-current opacity-45" />
          <circle cx="8" cy="5" r="1.5" className="fill-current opacity-50" />
          <circle cx="14" cy="5" r="1.5" className="fill-current opacity-40" />
          <rect x="6" y="14" width="28" height="2" rx="1" className="fill-current opacity-28" />
          <rect x="6" y="20" width="38" height="1.5" rx="0.75" className="fill-current opacity-22" />
        </svg>
      </div>
      <div className="ctm-web-pdf absolute right-[8%] bottom-[10%] h-[52%] opacity-0">
        <MiniPage className="h-full" />
      </div>
      <div className="ctm-web-flow absolute left-[48%] top-[44%]">
        <span className="material-symbols-outlined text-[14px] opacity-40">south_east</span>
      </div>
    </MotionWrap>
  );
}

export function CompressMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="ctm-compress-page absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[72%]" />
      </div>
      <div className="ctm-compress-arrows absolute inset-0 flex items-center justify-center gap-6">
        <span className="material-symbols-outlined text-[14px] opacity-35">compress</span>
      </div>
    </MotionWrap>
  );
}

export function RotateMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="ctm-rotate-page absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[68%]" />
      </div>
    </MotionWrap>
  );
}

export function WatermarkMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[70%]" />
      </div>
      <div className="ctm-wm-text absolute inset-0 flex items-center justify-center overflow-hidden">
        <span className="rotate-[-24deg] text-[9px] font-black uppercase tracking-[0.2em] opacity-50">
          Sample
        </span>
      </div>
    </MotionWrap>
  );
}

export function SignMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[68%]" />
      </div>
      <svg viewBox="0 0 80 32" className="ctm-sign-line absolute bottom-[22%] left-[12%] h-[22%] w-[76%]" aria-hidden>
        <path
          d="M4 22 C18 6, 34 28, 48 14 S72 8, 76 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="opacity-55"
          pathLength={1}
        />
      </svg>
    </MotionWrap>
  );
}

export function HighlightMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[68%]" />
      </div>
      <div className="ctm-hl-bar absolute left-[22%] top-[38%] h-[6%] w-[48%] rounded-sm bg-current opacity-35" />
      <div className="ctm-hl-bar-2 absolute left-[22%] top-[50%] h-[5%] w-[36%] rounded-sm bg-current opacity-28" />
    </MotionWrap>
  );
}

export function StampMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[68%]" />
      </div>
      <div className="ctm-stamp-disc absolute left-1/2 top-[8%] flex h-[34%] w-[34%] -translate-x-1/2 items-center justify-center rounded-full border-2 border-current opacity-50">
        <span className="text-[7px] font-black uppercase tracking-wider opacity-80">Approved</span>
      </div>
    </MotionWrap>
  );
}

export function CropMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[72%]" />
      </div>
      <div className="ctm-crop-frame absolute inset-[18%] origin-center border-2 border-dashed border-current opacity-45" />
    </MotionWrap>
  );
}

export function PaddingMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="ctm-pad-outer absolute inset-[12%] origin-center rounded-md border-2 border-current opacity-35" />
      <div className="ctm-pad-inner absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[52%]" />
      </div>
    </MotionWrap>
  );
}

export function OcrMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[70%]" label="" />
      </div>
      <div className="ctm-ocr-scan absolute left-[20%] right-[20%] h-0.5 bg-current opacity-60" />
      <div className="ctm-ocr-text absolute left-[24%] top-[42%] space-y-1 opacity-0">
        <div className="h-0.5 w-8 rounded bg-current opacity-40" />
        <div className="h-0.5 w-12 rounded bg-current opacity-35" />
        <div className="h-0.5 w-10 rounded bg-current opacity-30" />
      </div>
    </MotionWrap>
  );
}

export function ProtectMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center opacity-60">
        <MiniPage className="h-[62%]" />
      </div>
      <div className="ctm-lock-body absolute left-1/2 top-[30%] -translate-x-1/2">
        <svg viewBox="0 0 32 40" className="h-10 w-8" aria-hidden>
          <rect x="6" y="16" width="20" height="22" rx="3" className="fill-current opacity-45" />
          <path
            d="M10 16 V11 a6 6 0 0 1 12 0 v5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="ctm-lock-shackle opacity-55"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </MotionWrap>
  );
}

export function UnlockMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center opacity-60">
        <MiniPage className="h-[62%]" />
      </div>
      <div className="ctm-unlock-body absolute left-1/2 top-[30%] -translate-x-1/2">
        <svg viewBox="0 0 32 40" className="h-10 w-8" aria-hidden>
          <rect x="6" y="16" width="20" height="22" rx="3" className="fill-current opacity-45" />
          <path
            d="M10 16 V11 a6 6 0 0 1 12 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="ctm-unlock-shackle opacity-55"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </MotionWrap>
  );
}

export function RedactMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[68%]" />
      </div>
      <div className="ctm-redact-bar absolute left-[20%] top-[40%] h-[8%] w-[50%] rounded-sm bg-current opacity-50" />
      <div className="ctm-redact-bar-2 absolute left-[24%] top-[54%] h-[6%] w-[38%] rounded-sm bg-current opacity-40" />
    </MotionWrap>
  );
}

export function CompareMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="ctm-compare-left absolute left-[8%] bottom-[12%] h-[58%] w-[38%]">
        <MiniPage className="h-full" />
      </div>
      <div className="ctm-compare-right absolute right-[8%] bottom-[12%] h-[58%] w-[38%]">
        <MiniPage className="h-full" />
      </div>
      <div className="ctm-compare-icon absolute left-1/2 top-[20%] -translate-x-1/2">
        <span className="material-symbols-outlined text-[14px] opacity-45">compare</span>
      </div>
    </MotionWrap>
  );
}

export function MetadataMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[68%]" />
      </div>
      <div className="ctm-meta-tag absolute right-[14%] top-[18%] rounded bg-current px-1 py-0.5 text-[6px] font-bold uppercase opacity-50">
        Info
      </div>
    </MotionWrap>
  );
}

export function RepairMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="ctm-repair-page absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[68%]" />
      </div>
      <div className="ctm-repair-wrench absolute left-1/2 top-[12%] -translate-x-1/2">
        <span className="material-symbols-outlined text-[16px] opacity-45">build</span>
      </div>
    </MotionWrap>
  );
}

export function FormsMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[68%]" />
      </div>
      <div className="ctm-form-line absolute left-[22%] top-[38%] h-0.5 w-[50%] rounded bg-current opacity-35" />
      <div className="ctm-form-line-2 absolute left-[22%] top-[50%] h-0.5 w-[40%] rounded bg-current opacity-28" />
      <div className="ctm-form-check absolute left-[22%] top-[60%] h-2 w-2 rounded-sm border border-current opacity-40" />
    </MotionWrap>
  );
}

export function VerifyMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center opacity-60">
        <MiniPage className="h-[62%]" />
      </div>
      <div className="ctm-verify-badge absolute left-1/2 top-[22%] -translate-x-1/2 flex h-[30%] w-[30%] items-center justify-center rounded-full border-2 border-current opacity-50">
        <span className="material-symbols-outlined text-[12px] opacity-70">verified</span>
      </div>
    </MotionWrap>
  );
}

export function PdfaMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center">
        <MiniPage className="h-[68%]" />
      </div>
      <div className="ctm-pdfa-stamp absolute bottom-[18%] left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-wider opacity-50">
        PDF/A
      </div>
    </MotionWrap>
  );
}

export function ExcelMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="ctm-excel-grid absolute left-[10%] bottom-[10%] h-[50%] w-[44%]">
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
          <rect x="1" y="1" width="38" height="38" rx="3" className="fill-current opacity-30" />
          <line x1="1" y1="14" x2="39" y2="14" stroke="currentColor" strokeWidth="1" className="opacity-25" />
          <line x1="14" y1="1" x2="14" y2="39" stroke="currentColor" strokeWidth="1" className="opacity-25" />
        </svg>
      </div>
      <div className="ctm-excel-pdf absolute right-[8%] bottom-[12%] h-[52%] opacity-70">
        <MiniPage className="h-full" />
      </div>
    </MotionWrap>
  );
}

export function ExtractImagesMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="absolute inset-0 flex items-center justify-center opacity-50">
        <MiniPage className="h-[62%]" />
      </div>
      <div className="ctm-extract-img absolute left-[12%] top-[20%] h-[28%] w-[28%]">
        <MiniImage className="h-full" />
      </div>
      <div className="ctm-extract-img-2 absolute right-[12%] bottom-[16%] h-[24%] w-[24%]">
        <MiniImage className="h-full" />
      </div>
    </MotionWrap>
  );
}

export function WorkflowMotion(props: CardMotionProps) {
  return (
    <MotionWrap {...props}>
      <div className="ctm-flow-1 absolute left-[10%] top-[30%] h-[22%] w-[22%] rounded bg-current opacity-30" />
      <div className="ctm-flow-2 absolute left-[40%] top-[30%] h-[22%] w-[22%] rounded bg-current opacity-35" />
      <div className="ctm-flow-3 absolute right-[10%] top-[30%] h-[22%] w-[22%] rounded bg-current opacity-40" />
      <div className="ctm-flow-arrow absolute left-1/2 bottom-[20%] -translate-x-1/2">
        <span className="material-symbols-outlined text-[14px] opacity-40">arrow_forward</span>
      </div>
    </MotionWrap>
  );
}

export const TOOL_MOTIONS: Record<string, ComponentType<CardMotionProps>> = {
  "merge-pdf": MergeMotion,
  "split-pdf": SplitMotion,
  "organize-pdf": OrganizeMotion,
  "add-page-numbers": PageNumbersMotion,
  "pdf-to-jpg": PdfToJpgMotion,
  "jpg-to-pdf": JpgToPdfMotion,
  "pdf-to-word": PdfToWordMotion,
  "word-to-pdf": PdfToWordMotion,
  "pdf-to-powerpoint": PdfToJpgMotion,
  "powerpoint-to-pdf": PdfToJpgMotion,
  "excel-to-pdf": ExcelMotion,
  "website-to-pdf": WebsiteToPdfMotion,
  "compress-pdf": CompressMotion,
  "rotate-pdf": RotateMotion,
  "watermark-pdf": WatermarkMotion,
  "sign-pdf": SignMotion,
  "highlight-pdf": HighlightMotion,
  "stamp-pdf": StampMotion,
  "crop-pdf": CropMotion,
  "add-padding-pdf": PaddingMotion,
  "ocr-pdf": OcrMotion,
  "protect-pdf": ProtectMotion,
  "unlock-pdf": UnlockMotion,
  "redact-pdf": RedactMotion,
  "compare-pdf": CompareMotion,
  "edit-metadata-pdf": MetadataMotion,
  "repair-pdf": RepairMotion,
  "fill-pdf-forms": FormsMotion,
  "verify-signature-pdf": VerifyMotion,
  "pdf-to-pdfa": PdfaMotion,
  "pdfa-preflight": VerifyMotion,
  "pdf-to-pdfa-server": PdfaMotion,
  "pdf-to-excel": ExcelMotion,
  "extract-images-pdf": ExtractImagesMotion,
  "pdf-workflow": WorkflowMotion,
  "extract-text-pdf": OcrMotion,
  "pdf-to-png": PdfToJpgMotion,
  "png-to-pdf": JpgToPdfMotion,
  "reverse-pdf": OrganizeMotion,
  "grayscale-pdf": OcrMotion,
  "invert-pdf": HighlightMotion,
  "pdf-info": MetadataMotion,
  "flatten-pdf": PaddingMotion,
  "remove-blank-pages": SplitMotion,
  "duplicate-pages": MergeMotion,
  "extract-pages": SplitMotion,
  "remove-annotations": RedactMotion,
  "add-image-pdf": JpgToPdfMotion,
  "resize-pdf": CropMotion,
  "n-up-pdf": OrganizeMotion,
  "booklet-pdf": OrganizeMotion,
  "sanitize-pdf": ProtectMotion,
  "compress-images-pdf": CompressMotion,
  "split-by-bookmarks": SplitMotion,
  "bookmarks-pdf": PageNumbersMotion,
  "header-footer-pdf": PageNumbersMotion,
  "webp-to-pdf": JpgToPdfMotion,
  "split-by-size": SplitMotion,
  "merge-alternate": MergeMotion,
  "add-links-pdf": WebsiteToPdfMotion,
  "text-to-pdf": PdfToWordMotion,
  "auto-rotate-pdf": RotateMotion,
  "extract-attachments-pdf": ExtractImagesMotion,
  "tiff-to-pdf": JpgToPdfMotion,
  "visual-diff-pdf": CompareMotion,
  "batch-workflow": WorkflowMotion,
  "add-attachments-pdf": ExtractImagesMotion,
  "heic-to-pdf": JpgToPdfMotion,
  "bates-numbering-pdf": PageNumbersMotion,
  "pdf-to-html": PdfToWordMotion,
  "split-by-text": SplitMotion,
  "csv-to-pdf": ExcelMotion,
  "pdf-to-csv": ExcelMotion,
  "pdf-summary": OcrMotion,
  "create-pdf-form": FormsMotion,
  "markdown-to-pdf": PdfToWordMotion,
  "bmp-to-pdf": JpgToPdfMotion,
  "gif-to-pdf": JpgToPdfMotion,
  "insert-pages-pdf": MergeMotion,
  "overlay-pdf": WatermarkMotion,
  "pdf-to-markdown": ExtractImagesMotion,
  "json-to-pdf": MetadataMotion,
  "add-blank-pages": OrganizeMotion,
  "shuffle-pdf": OrganizeMotion,
  "mirror-pdf": RotateMotion,
  "posterize-pdf": OrganizeMotion,
  "fit-to-page-pdf": CropMotion,
  "page-labels-pdf": PageNumbersMotion,
  "pdf-to-json": MetadataMotion,
  "tile-pdf": OrganizeMotion,
  "replace-pages-pdf": MergeMotion,
  "add-background-pdf": PaddingMotion,
  "pdf-validator": VerifyMotion,
  "xml-to-pdf": PdfToWordMotion,
  "split-even-odd": SplitMotion,
  "export-bookmarks-pdf": PageNumbersMotion,
  "qr-code-pdf": StampMotion,
  "invoice-pdf": PdfToWordMotion,
  "linearize-pdf": CompressMotion,
  "duplicate-range-pdf": MergeMotion,
  "svg-to-pdf": JpgToPdfMotion,
  "sort-pages-size-pdf": OrganizeMotion,
  "pdf-to-pdfa-3": PdfaMotion,
  "combine-text-pdf": PdfToWordMotion,
  "remove-metadata-pdf": ProtectMotion,
  "split-every-n-pages": SplitMotion,
};
