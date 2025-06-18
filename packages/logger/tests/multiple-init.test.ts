import { describe, it, expect } from 'vitest';
import { initLogger } from '@renewx/logger';


describe('initLogger multiple calls', () => {
  it('returns same unsubscribe while active and new one after off', () => {
    const un1 = initLogger(() => {});
    const un2 = initLogger(() => {});
    expect(un1).toBe(un2);
    un1();
    const un3 = initLogger(() => {});
    expect(un3).not.toBe(un1);
    un3();
  });
});
