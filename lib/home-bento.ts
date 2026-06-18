import type { ToolCategory } from "@/lib/tools";

/** Bento cell spans when showing all tools (Tailwind grid classes). */
export const BENTO_SPANS: Record<string, string> = {
  "merge-pdf": "col-span-2 row-span-1 md:row-span-2",
  "compress-pdf": "col-span-2 row-span-1",
  "sign-pdf": "col-span-1 row-span-1 md:row-span-2",
  "split-pdf": "col-span-1 row-span-1",
  "organize-pdf": "col-span-2 row-span-1",
  "pdf-to-jpg": "col-span-2 row-span-1",
  "protect-pdf": "col-span-1 row-span-1",
  "highlight-pdf": "col-span-1 row-span-1",
  "website-to-pdf": "col-span-2 row-span-1",
};

export type BentoSize = "sm" | "md" | "lg";

export function getBentoSpan(toolId: string, category: ToolCategory | "all"): string {
  if (category !== "all") return "";
  return BENTO_SPANS[toolId] ?? "col-span-1 row-span-1";
}

export function getBentoSize(toolId: string, category: ToolCategory | "all"): BentoSize {
  if (category !== "all") return "sm";
  const span = BENTO_SPANS[toolId];
  if (span?.includes("row-span-2") && span.includes("col-span-2")) return "lg";
  if (span?.includes("row-span-2") || span?.includes("col-span-2")) return "md";
  return "sm";
}
