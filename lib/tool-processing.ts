import { TOOLS } from "@/lib/tools";

export type ProcessingTier = "local" | "server" | "limited";

const TIER_OVERRIDES: Partial<Record<string, ProcessingTier>> = {
  "website-to-pdf": "server",
  "verify-signature-pdf": "limited",
  "pdf-to-pdfa": "limited",
};

export function getToolProcessingTier(toolId: string): ProcessingTier {
  return TIER_OVERRIDES[toolId] ?? "local";
}

export function getToolProcessingTierFromHref(href: string): ProcessingTier {
  const tool = TOOLS.find((entry) => entry.href === href);
  return tool ? getToolProcessingTier(tool.id) : "local";
}
