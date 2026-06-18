import { describe, expect, it } from "vitest";
import { protectPDF } from "../protect";
import { createTestPdf } from "./helpers";

describe("protectPDF", () => {
  it("encrypts a PDF and changes the output bytes", async () => {
    const source = await createTestPdf(1);
    const protectedBytes = await protectPDF(source, "secret123");

    expect(protectedBytes.byteLength).toBeGreaterThan(0);
    expect(Buffer.from(protectedBytes).equals(Buffer.from(source))).toBe(false);
  });

  it("requires a non-empty password", async () => {
    const source = await createTestPdf(1);
    await expect(protectPDF(source, "")).rejects.toThrow("A password is required.");
  });
});
