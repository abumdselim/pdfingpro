import { TOOLS } from "@/lib/tools";

export type ProcessingTier = "local" | "server" | "limited";

/** Tools that send data to our server (not full client-side). */
export const SERVER_TOOL_IDS = new Set<string>([
  "website-to-pdf",
  "word-to-pdf",
  "powerpoint-to-pdf",
  "excel-to-pdf",
  "pdf-to-pdfa-server",
]);

/**
 * Tools that run locally but cannot guarantee professional-grade output
 * (compliance, layout fidelity, cryptographic signatures, etc.).
 */
export const LIMITED_TOOL_IDS = new Set<string>([
  "pdf-to-pdfa",
  "pdf-to-pdfa-3",
  "pdfa-preflight",
  "verify-signature-pdf",
  "sign-pdf",
  "pdf-summary",
  "linearize-pdf",
  "pdf-validator",
  "pdf-to-word",
  "pdf-to-powerpoint",
  "pdf-to-excel",
  "pdf-to-csv",
  "ocr-pdf",
]);

const TIER_OVERRIDES: Partial<Record<string, ProcessingTier>> = {
  ...Object.fromEntries(
    [...SERVER_TOOL_IDS].map((id) => [id, "server" as const])
  ),
  ...Object.fromEntries(
    [...LIMITED_TOOL_IDS].map((id) => [id, "limited" as const])
  ),
};

export function getToolProcessingTier(toolId: string): ProcessingTier {
  return TIER_OVERRIDES[toolId] ?? "local";
}

export function getToolProcessingTierFromHref(href: string): ProcessingTier {
  const tool = TOOLS.find((entry) => entry.href === href);
  return tool ? getToolProcessingTier(tool.id) : "local";
}

export function getToolsByTier(tier: ProcessingTier) {
  return TOOLS.filter((tool) => getToolProcessingTier(tool.id) === tier);
}
