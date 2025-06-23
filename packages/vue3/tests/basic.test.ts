import { describe, it, expect } from "vitest";
import { store } from "@renewx/core";
import { useStore } from "../src/useStore";

describe("vue3 useStore", () => {
  it("wraps store in ref", () => {
    const s = store(1);
    const r = useStore(s);
    expect(r.value).toBe(1);
  });

  it("updates ref when store changes", () => {
    const s = store(0);
    const r = useStore(s);
    s.set(2);
    expect(r.value).toBe(2);
  });

  it("returns same ref for same store", () => {
    const s = store(5);
    const a = useStore(s);
    const b = useStore(s);
    expect(a).toBe(b);
  });
});
