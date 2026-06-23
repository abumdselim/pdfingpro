import { describe, expect, it } from "vitest";
import { bookmarkSplitRanges, parseBookmarkLines } from "@/lib/pdf/bookmarks";

describe("parseBookmarkLines", () => {
  it("parses title|page lines", () => {
    const entries = parseBookmarkLines("Intro|1\nChapter 2|8", 20);
    expect(entries).toEqual([
      { title: "Intro", page: 1 },
      { title: "Chapter 2", page: 8 },
    ]);
  });

  it("rejects invalid page numbers", () => {
    expect(parseBookmarkLines("Bad|99", 10)).toBeNull();
  });
});

describe("bookmarkSplitRanges", () => {
  it("creates ranges between bookmark pages", () => {
    const ranges = bookmarkSplitRanges(
      [
        { title: "A", page: 1 },
        { title: "B", page: 5 },
        { title: "C", page: 9 },
      ],
      12
    );
    expect(ranges).toEqual([
      { from: 1, to: 4, label: "a" },
      { from: 5, to: 8, label: "b" },
      { from: 9, to: 12, label: "c" },
    ]);
  });
});
