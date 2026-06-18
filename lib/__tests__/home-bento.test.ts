import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { join } from "path";
import { TOOLS } from "@/lib/tools";
import { BENTO_SPANS, getBentoSpan, getBentoSize } from "@/lib/home-bento";
import { TOOL_CARD_THEMES } from "@/lib/home-card-themes";
import { TOOL_MOTIONS } from "@/components/home/card-motions/motions";
import en from "@/locales/en.json";

describe("home bento", () => {
  it("every tool has a matching page route file", () => {
    for (const tool of TOOLS) {
      const slug = tool.href.replace(/^\//, "");
      const pagePath = join(process.cwd(), "app", "(tools)", slug, "page.tsx");
      expect(existsSync(pagePath), `missing page for ${tool.href}`).toBe(true);
    }
  });

  it("bento spans reference valid tool ids", () => {
    for (const id of Object.keys(BENTO_SPANS)) {
      expect(TOOLS.some((t) => t.id === id)).toBe(true);
    }
  });

  it("getBentoSpan returns empty string when filtered", () => {
    expect(getBentoSpan("merge-pdf", "edit")).toBe("");
    expect(getBentoSize("merge-pdf", "edit")).toBe("sm");
  });

  it("every tool has a card theme", () => {
    for (const tool of TOOLS) {
      expect(TOOL_CARD_THEMES[tool.id], `missing theme for ${tool.id}`).toBeTruthy();
    }
  });

  it("every tool has a card motion", () => {
    for (const tool of TOOLS) {
      expect(TOOL_MOTIONS[tool.id], `missing motion for ${tool.id}`).toBeTruthy();
    }
  });

  it("homepage privacy i18n keys exist", () => {
    for (const key of [
      "home.bento.howItWorks",
      "home.filesStay.title",
      "home.offline.pillar.offline",
      "home.offline.pillar.secure",
      "home.offline.pillar.pwa",
    ]) {
      expect(en[key as keyof typeof en], key).toBeTruthy();
    }
  });
});
