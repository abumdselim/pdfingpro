"use client";

import { usePathname } from "next/navigation";
import {
  getToolProcessingTierFromHref,
  type ProcessingTier,
} from "@/lib/tool-processing";

export function useToolProcessingTier(override?: ProcessingTier): ProcessingTier {
  const pathname = usePathname();
  return override ?? getToolProcessingTierFromHref(pathname);
}
