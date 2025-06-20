import { describe, it, expect, vi } from "vitest";
import { setDiffUnInterval } from "../src/fn/set-diff-un-interval";

describe("setDiffUnInterval", () => {
  it("calls with time difference and stops on unsubscribe", () => {
    vi.useFakeTimers();
    const diffs: number[] = [];
    const un = setDiffUnInterval((d) => diffs.push(d), 100);
    vi.advanceTimersByTime(250);
    un();
    expect(diffs).toEqual([100, 100, 50]);
    vi.advanceTimersByTime(500);
    expect(diffs).toEqual([100, 100, 50]);
    vi.useRealTimers();
  });

  it("handles unsubscribe during tick", () => {
    vi.useFakeTimers();
    const diffs: number[] = [];
    let un: () => void;
    un = setDiffUnInterval((d) => {
      diffs.push(d);
      un();
    }, 100);
    vi.advanceTimersByTime(100);
    expect(diffs).toEqual([100]);
    vi.advanceTimersByTime(200);
    expect(diffs).toEqual([100]);
    vi.useRealTimers();
  });
});
