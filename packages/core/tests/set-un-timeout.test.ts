import { describe, it, expect, vi } from "vitest";
import { setUnTimeout } from "../src/fn/set-un-timeout";

describe("setUnTimeout", () => {
  it("executes callback immediately when unsubscribed before timeout", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const un = setUnTimeout(fn, 100);
    un();
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("executes callback after timeout if not unsubscribed", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const un = setUnTimeout(fn, 50);
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
    un();
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
