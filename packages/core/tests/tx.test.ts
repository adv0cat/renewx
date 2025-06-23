import { describe, it, expect, vi } from "vitest";
import { store } from "../src/store";
import { tx } from "../src/utils/tx";

describe("tx", () => {
  it("commits changes to multiple stores", async () => {
    const a = store(1);
    const b = store(2);
    const update = tx([a, b], async ([at, bt], x: number, y: number) => {
      at.set(at.get() + x);
      bt.set(bt.get() + y);
      return at.get() + bt.get();
    });

    const result = await update(3, 4);
    expect(result).toBe(10);
    expect(a.get()).toBe(4);
    expect(b.get()).toBe(6);
  });

  it("rolls back when state changes during transaction", async () => {
    vi.useFakeTimers();
    const s = store(0);
    const op = tx([s], async ([st], v: number) => {
      await new Promise((r) => setTimeout(r, 10));
      st.set(st.get() + v);
    });

    const p = op(5);
    vi.advanceTimersByTime(5);
    s.set(1);
    vi.advanceTimersByTime(10);

    await expect(p).rejects.toThrow();
    expect(s.get()).toBe(1);
    vi.useRealTimers();
  });
});
