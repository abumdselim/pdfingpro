import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getRecentSearches,
  rememberRecentSearch,
  searchTools,
  splitByHighlight,
} from "@/lib/tool-search";

const t = (key: string) => {
  const map: Record<string, string> = {
    "tools.mergePdf.title": "Merge PDF",
    "tools.mergePdf.description": "Combine multiple PDF files into one document.",
    "tools.compressPdf.title": "Compress PDF",
    "tools.compressPdf.description": "Reduce PDF file size.",
    "tools.protectPdf.title": "Protect PDF",
    "tools.protectPdf.description": "Add a password to your PDF.",
    "categories.organize": "Organize",
    "categories.security": "Security",
  };
  return map[key] ?? key;
};

describe("searchTools", () => {
  it("finds tools by alias keywords", () => {
    const results = searchTools("combine", t);
    expect(results[0]?.id).toBe("merge-pdf");
  });

  it("finds tools by category name", () => {
    const results = searchTools("security", t);
    expect(results.some((tool) => tool.id === "protect-pdf")).toBe(true);
  });

  it("ranks title matches above description matches", () => {
    const results = searchTools("compress", t);
    expect(results[0]?.id).toBe("compress-pdf");
  });

  it("tolerates typos with fuzzy matching", () => {
    const results = searchTools("mrege", t);
    expect(results[0]?.id).toBe("merge-pdf");
  });
});

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => storage.clear(),
  });
});

describe("rememberRecentSearch", () => {

  it("stores and deduplicates recent queries", () => {
    rememberRecentSearch("merge");
    rememberRecentSearch("compress");
    rememberRecentSearch("merge");

    expect(getRecentSearches()).toEqual(["merge", "compress"]);
  });

  it("ignores very short queries", () => {
    rememberRecentSearch("a");
    expect(getRecentSearches()).toEqual([]);
  });
});

describe("splitByHighlight", () => {
  it("marks matching substrings", () => {
    const parts = splitByHighlight("Merge PDF", "merge");
    expect(parts).toEqual([
      { text: "Merge", match: true },
      { text: " PDF", match: false },
    ]);
  });
});
