import { describe, expect, it } from "vitest";
import en from "@/locales/en.json";

const REQUIRED_TOUCH_KEYS = [
  "organize.hintTouch",
  "organize.hintMouse",
  "sign.hintWithSig",
  "sign.hintMouse",
  "sign.hintNoSig",
  "highlight.hintHighlight",
  "highlight.hintHighlightTouch",
  "highlight.hintDraw",
  "highlight.hintSelected",
  "stamp.hintTouch",
  "stamp.hintMouse",
  "common.removeFile",
];

describe("touch UX i18n keys", () => {
  it("defines all required touch hint strings", () => {
    for (const key of REQUIRED_TOUCH_KEYS) {
      expect(en[key as keyof typeof en], `missing key: ${key}`).toBeTruthy();
    }
  });
});
