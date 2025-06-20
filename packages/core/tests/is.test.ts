import { describe, it, expect } from "vitest";
import { store, isAnyStore, isActionStore } from "@renewx/core";
import { isStateChanged } from "../src/utils/is";

describe("utils/is", () => {
  it("detects state changes correctly", () => {
    expect(isStateChanged({ a: 1 }, { a: 1 })).toBe(false);
    expect(isStateChanged({ a: 1 }, { a: 2 })).toBe(true);
    expect(isStateChanged({ a: { b: 1 } }, { a: { b: 1 } })).toBe(false);
    expect(isStateChanged({ a: { b: 1 } }, { a: { b: 2 } })).toBe(true);
    expect(isStateChanged({ a: 1 }, { a: 1, c: 2 })).toBe(true);
  });

  it("identifies store types", () => {
    const s = store(0);
    expect(isAnyStore(s)).toBe(true);
    expect(isAnyStore({})).toBe(false);
    expect(isActionStore(s)).toBe(true);
    expect(isActionStore(s.readOnly)).toBe(false);
  });
});
