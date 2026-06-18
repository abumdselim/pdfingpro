import { describe, expect, it } from "vitest";
import {
  assertSafePublicUrl,
  isPrivateIpAddress,
  normalizeHttpUrl,
  suggestedPdfFilename,
} from "../url-validation";

describe("normalizeHttpUrl", () => {
  it("adds https when missing", () => {
    expect(normalizeHttpUrl("example.com").href).toBe("https://example.com/");
  });

  it("rejects unsupported protocols", () => {
    expect(() => normalizeHttpUrl("file:///etc/passwd")).toThrow("Only HTTP and HTTPS");
  });
});

describe("isPrivateIpAddress", () => {
  it("detects common private ranges", () => {
    expect(isPrivateIpAddress("127.0.0.1")).toBe(true);
    expect(isPrivateIpAddress("10.0.0.5")).toBe(true);
    expect(isPrivateIpAddress("192.168.1.10")).toBe(true);
    expect(isPrivateIpAddress("8.8.8.8")).toBe(false);
  });
});

describe("assertSafePublicUrl", () => {
  it("rejects localhost", async () => {
    await expect(assertSafePublicUrl("http://localhost/admin")).rejects.toThrow("not allowed");
  });

  it("accepts public hostnames", async () => {
    const url = await assertSafePublicUrl("https://example.com/page");
    expect(url.hostname).toBe("example.com");
  });
});

describe("suggestedPdfFilename", () => {
  it("builds a readable filename", () => {
    expect(suggestedPdfFilename(new URL("https://www.example.com/path"))).toBe("example.com.pdf");
  });
});
