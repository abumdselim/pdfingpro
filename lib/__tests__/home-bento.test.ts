import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { join } from "path";
import { TOOLS } from "@/lib/tools";
import { BENTO_SPANS, QUICK_TOOLS, getBentoSpan, getBentoSize } from "@/lib/home-bento";
import en from "@/locales/en.json";

describe("home bento", () => {
  it("every tool has a matching page route file", () => {
    for (const tool of TOOLS) {
      const slug = tool.href.replace(/^\//, "");
      const pagePath = join(process.cwd(), "app", "(tools)", slug, "page.tsx");
      expect(existsSync(pagePath), `missing page for ${tool.href}`).toBe(true);
    }
  });

  it("quick tools reference valid tool ids", () => {
    for (const id of QUICK_TOOLS) {
      expect(TOOLS.some((t) => t.id === id)).toBe(true);
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

  it("home bento i18n keys exist", () => {
    for (const key of [
      "home.bento.openTool",
      "home.bento.howItWorks",
      "home.bento.toolsTitle",
      "home.bento.toolsSubtitle",
    ]) {
      expect(en[key as keyof typeof en], key).toBeTruthy();
    }
  });
});
