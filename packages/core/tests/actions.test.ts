import { describe, it, expect } from 'vitest';
import { store, action, actions } from '@renewx/core';

describe('actions', () => {
  it('creates single action that updates store', () => {
    const counter = store(0);
    const inc = action(counter, (state: number, v: number) => state + v);
    inc(2);
    expect(counter.get()).toBe(2);
  });

  it('groups actions and exposes store interface', () => {
    const s = store(1);
    const group = actions(s, {
      add: (state: number, x: number) => state + x,
      sub: (state: number, x: number) => state - x,
    });

    expect(group.store).toBe(s);
    expect(group.set).toBe(s.set);

    group.add(4);
    expect(s.get()).toBe(5);
    group.sub(2);
    expect(s.get()).toBe(3);

    group.off();
    group.add(1);
    expect(s.get()).toBe(3);
  });
});
