import { describe, expect, it } from "vitest";
import { TOOLS } from "@/lib/tools";
import {
  getToolProcessingTier,
  getToolsByTier,
  LIMITED_TOOL_IDS,
  SERVER_TOOL_IDS,
} from "@/lib/tool-processing";

describe("tool processing tiers", () => {
  it("marks known server and limited tools", () => {
    for (const id of SERVER_TOOL_IDS) {
      expect(getToolProcessingTier(id)).toBe("server");
    }
    for (const id of LIMITED_TOOL_IDS) {
      expect(getToolProcessingTier(id)).toBe("limited");
    }
  });

  it("defaults all other tools to local", () => {
    for (const tool of TOOLS) {
      const tier = getToolProcessingTier(tool.id);
      if (SERVER_TOOL_IDS.has(tool.id)) {
        expect(tier).toBe("server");
      } else if (LIMITED_TOOL_IDS.has(tool.id)) {
        expect(tier).toBe("limited");
      } else {
        expect(tier).toBe("local");
      }
    }
  });

  it("groups tools by tier", () => {
    const local = getToolsByTier("local");
    const limited = getToolsByTier("limited");
    const server = getToolsByTier("server");

    expect(local.length + limited.length + server.length).toBe(TOOLS.length);
    expect(server).toHaveLength(SERVER_TOOL_IDS.size);
    expect(limited).toHaveLength(LIMITED_TOOL_IDS.size);
  });
});
