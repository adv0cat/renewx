import { describe, it, expect } from "vitest";
import { store } from "@renewx/core";
import { initLogger } from "../src/initLogger";

describe("logger", () => {
  it("returns unsubscribe function", () => {
    const un = initLogger(() => {});
    expect(typeof un).toBe("function");
    un();
  });

  it("logs store updates", () => {
    const logs: string[] = [];
    const un = initLogger((...args) => logs.push(args.join(" ")));
    const s = store(0, "counter");
    s.set(1);
    expect(logs[0]).toMatch("counter.#init:");
    expect(logs[1]).toMatch("counter.#set:");
    un();
  });

  it("stops logging after unsubscribe", () => {
    const logs: string[] = [];
    const un = initLogger((...args) => logs.push(args.join(" ")));
    const s = store(0, "num");
    s.set(1);
    un();
    s.set(2);
    expect(logs.length).toBe(2);
  });
});
