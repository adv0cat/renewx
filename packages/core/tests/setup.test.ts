import { describe, it, expect } from "vitest";
import { store, watch, setup, type Store } from "@renewx/core";

describe("setup", () => {
  it("creates reusable watcher with cleanup", () => {
    const values: number[] = [];
    const setupWatcher = setup((cleaner, s: Store<number>) => {
      cleaner.add(
        watch(s, (v) => {
          values.push(v);
        }),
      );
    });

    const s = store(0);
    const c = setupWatcher(s);
    s.set(1);
    expect(values).toEqual([0, 1]);
    c.off();
    s.set(2);
    expect(values).toEqual([0, 1]);
  });
});
