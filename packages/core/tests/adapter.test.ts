import { describe, it, expect } from "vitest";
import { store } from "../src/store";
import { adapter } from "../src/adapter";
import { watch } from "../src/fn/watch";

describe("adapter", () => {
  it("updates when base store changes", () => {
    const base = store(2);
    const doubled = adapter(base, (v) => v * 2);
    const values: number[] = [];
    watch(doubled, (v) => {
      values.push(v);
    });
    base.set(5);
    expect(values).toEqual([4, 10]);
  });
});
