import { describe, it, expect } from "vitest";
import { store, watch } from "@renewx/core";

describe("core store", () => {
  it("returns initial state", () => {
    const s = store(1);
    expect(s.get()).toBe(1);
  });

  it("updates state with set", () => {
    const s = store(0);
    s.set(5);
    expect(s.get()).toBe(5);
  });

  it("notifies watchers and stops after off", () => {
    const s = store(0);
    const values: number[] = [];
    watch(s, (v) => {
      values.push(v);
    });
    s.set(1);
    expect(values).toEqual([0, 1]);
    s.off();
    s.set(2);
    expect(values).toEqual([0, 1]);
  });
});
