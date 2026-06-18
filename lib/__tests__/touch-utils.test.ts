import { describe, expect, it, vi } from "vitest";
import {
  MIN_TOUCH_TARGET,
  debounce,
  getTouchDistance,
} from "../touch-utils";

describe("touch-utils", () => {
  it("MIN_TOUCH_TARGET meets WCAG 44px minimum", () => {
    expect(MIN_TOUCH_TARGET).toBeGreaterThanOrEqual(44);
  });

  it("getTouchDistance returns hypotenuse between two touches", () => {
    const a = { clientX: 0, clientY: 0 } as Touch;
    const b = { clientX: 3, clientY: 4 } as Touch;
    expect(getTouchDistance(a, b)).toBe(5);
  });

  it("debounce delays invocation", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
