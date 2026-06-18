import { describe, expect, it } from "vitest";
import { getAdaptiveProfile, estimateWorkingSetMb } from "../memory";

describe("getAdaptiveProfile", () => {
  it("uses normal tier for small documents", () => {
    const profile = getAdaptiveProfile(2 * 1024 * 1024, 10);
    expect(profile.tier).toBe("normal");
    expect(profile.thumbnailScale).toBe(0.35);
    expect(profile.yieldMs).toBe(0);
  });

  it("scales down for large files", () => {
    const profile = getAdaptiveProfile(60 * 1024 * 1024, 120);
    expect(profile.tier).toBe("large");
    expect(profile.thumbnailScale).toBeLessThan(0.35);
    expect(profile.yieldMs).toBeGreaterThan(0);
  });

  it("uses extreme tier for very large documents", () => {
    const profile = getAdaptiveProfile(400 * 1024 * 1024, 600);
    expect(profile.tier).toBe("extreme");
    expect(profile.renderScale).toBeLessThanOrEqual(0.9);
  });
});

describe("estimateWorkingSetMb", () => {
  it("returns a positive estimate", () => {
    expect(estimateWorkingSetMb(10 * 1024 * 1024, 50)).toBeGreaterThan(0);
  });
});
