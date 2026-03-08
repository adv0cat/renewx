import { describe, it, expect } from "vitest";
import { store } from "../src/store";
import { adapter } from "../src/adapter";
import { watch } from "../src/fn/watch";

describe("nested watch", () => {
  it("keeps the latest outer store state when the inner store emits", () => {
    const outer = store(0);
    const inner = store("b0");
    const pairs: Array<{ outer: number; inner: string }> = [];

    watch(outer, (outerState) =>
      watch(inner, (innerState) => {
        pairs.push({ outer: outerState, inner: innerState });
      }),
    );

    outer.set(1);
    inner.set("b1");
    outer.set(2);
    inner.set("b2");

    expect(pairs).toEqual([
      { outer: 0, inner: "b0" },
      { outer: 1, inner: "b0" },
      { outer: 1, inner: "b1" },
      { outer: 2, inner: "b1" },
      { outer: 2, inner: "b2" },
    ]);
  });

  it("does not mix a previous store state with a new adapter state", () => {
    const base = store(0);
    const doubled = adapter(base, (value) => value * 2);
    const pairs: Array<{ base: number; doubled: number }> = [];

    watch(base, (baseState) =>
      watch(doubled, (doubledState) => {
        pairs.push({ base: baseState, doubled: doubledState });
      }),
    );

    pairs.length = 0;

    base.set(1);
    expect(pairs).toEqual([{ base: 1, doubled: 2 }]);

    base.set(2);
    expect(pairs).toEqual([
      { base: 1, doubled: 2 },
      { base: 2, doubled: 4 },
    ]);
    expect(pairs).not.toContainEqual({ base: 1, doubled: 4 });
  });

  it("does not mix a previous adapter state with a new downstream adapter state", () => {
    const base = store(0);
    const doubled = adapter(base, (value) => value * 2);
    const plusOne = adapter(doubled, (value) => value + 1);
    const pairs: Array<{ doubled: number; plusOne: number }> = [];

    watch(doubled, (doubledState) =>
      watch(plusOne, (plusOneState) => {
        pairs.push({ doubled: doubledState, plusOne: plusOneState });
      }),
    );

    pairs.length = 0;

    base.set(1);
    expect(pairs).toEqual([{ doubled: 2, plusOne: 3 }]);

    base.set(2);
    expect(pairs).toEqual([
      { doubled: 2, plusOne: 3 },
      { doubled: 4, plusOne: 5 },
    ]);
    expect(pairs).not.toContainEqual({ doubled: 2, plusOne: 5 });
  });

  it("does not mix sibling adapters derived from the same store", () => {
    const base = store(0);
    const earlyAdapter = adapter(base, (value) => value + 10);
    const lateAdapter = adapter(base, (value) => value * 2);
    const pairs: Array<{ late: number; early: number }> = [];

    watch(lateAdapter, (lateState) =>
      watch(earlyAdapter, (earlyState) => {
        pairs.push({ late: lateState, early: earlyState });
      }),
    );

    pairs.length = 0;

    base.set(1);
    expect(pairs).toEqual([{ late: 2, early: 11 }]);
    expect(pairs).not.toContainEqual({ late: 0, early: 11 });
  });
});

describe("watch array snapshots", () => {
  it("keeps watch([store, adapter]) consistent", () => {
    const base = store(0);
    const doubled = adapter(base, (value) => value * 2);
    const snapshots: Array<readonly [number, number]> = [];

    watch([base, doubled], (states) => {
      snapshots.push(states);
    });

    base.set(1);
    base.set(2);

    expect(snapshots).toEqual([
      [0, 0],
      [1, 2],
      [2, 4],
    ]);
  });

  it("keeps watch([store, adapter, adapter]) consistent", () => {
    const base = store(0);
    const doubled = adapter(base, (value) => value * 2);
    const plusOne = adapter(doubled, (value) => value + 1);
    const snapshots: Array<readonly [number, number, number]> = [];

    watch([base, doubled, plusOne], (states) => {
      snapshots.push(states);
    });

    base.set(1);
    base.set(2);

    expect(snapshots).toEqual([
      [0, 0, 1],
      [1, 2, 3],
      [2, 4, 5],
    ]);
  });

  it("keeps watch([adapter, adapter]) consistent", () => {
    const base = store(0);
    const doubled = adapter(base, (value) => value * 2);
    const plusOne = adapter(doubled, (value) => value + 1);
    const snapshots: Array<readonly [number, number]> = [];

    watch([doubled, plusOne], (states) => {
      snapshots.push(states);
    });

    base.set(1);
    base.set(2);

    expect(snapshots).toEqual([
      [0, 1],
      [2, 3],
      [4, 5],
    ]);
  });

  it("keeps watch([sibling adapter, sibling adapter]) consistent", () => {
    const base = store(0);
    const earlyAdapter = adapter(base, (value) => value + 10);
    const lateAdapter = adapter(base, (value) => value * 2);
    const snapshots: Array<readonly [number, number]> = [];

    watch([lateAdapter, earlyAdapter], (states) => {
      snapshots.push(states);
    });

    base.set(1);
    base.set(2);

    expect(snapshots).toEqual([
      [0, 10],
      [2, 11],
      [4, 12],
    ]);
  });
});
