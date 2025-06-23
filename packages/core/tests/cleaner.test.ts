import { describe, it, expect, vi } from "vitest";
import { cleaner } from "../src/fn/cleaner";

describe("cleaner", () => {
  it("cleans up added disposables", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const fn3 = vi.fn();
    const obj = { off: fn1 };

    const c = cleaner(obj, fn2);
    c.add(fn3);
    c.remove(fn2);
    c.off();
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).not.toHaveBeenCalled();
    expect(fn3).toHaveBeenCalledTimes(1);
  });
});
