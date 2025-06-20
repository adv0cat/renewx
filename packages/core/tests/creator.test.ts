import { describe, it, expect } from "vitest";
import { store, creator } from "@renewx/core";

describe("creator", () => {
  it("wraps initialization and cleanup", () => {
    const createCounter = creator(() => {
      const s = store(0);
      return { store: s };
    });

    const c = createCounter();
    expect(typeof c.off).toBe("function");
    c.store.set(5);
    expect(c.store.get()).toBe(5);
    c.off();
    expect(c.store.isOff()).toBe(true);
  });
});
