import { describe, it, expect } from "vitest";
import { effectScope } from "vue";
import { store } from "@renewx/core";
import { useStore } from "../src/useStore";

describe("useStore with withOff", () => {
  it("offs store when scope disposed", () => {
    const s = store(1);
    const scope = effectScope();
    scope.run(() => {
      useStore(s, { withOff: true });
    });
    expect(s.isOff()).toBe(false);
    scope.stop();
    expect(s.isOff()).toBe(true);
  });
});
