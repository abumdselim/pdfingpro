import { describe, expect, it } from "vitest";
import { TOOLS } from "@/lib/tools";
import { getToolProcessingTier } from "@/lib/tool-processing";

describe("tool processing tiers", () => {
  it("defaults all tools to local except known overrides", () => {
    for (const tool of TOOLS) {
      const tier = getToolProcessingTier(tool.id);
      if (tool.id === "website-to-pdf") {
        expect(tier).toBe("server");
      } else if (tool.id === "verify-signature-pdf" || tool.id === "pdf-to-pdfa") {
        expect(tier).toBe("limited");
      } else {
        expect(tier).toBe("local");
      }
    }
  });
});
