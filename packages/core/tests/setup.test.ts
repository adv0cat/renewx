import { describe, it, expect } from "vitest";
import type { Store } from "../src/types/store";
import { setup } from "../src/fn/setup";
import { store } from "../src/store";
import { watch } from "../src/fn/watch";

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
