import { describe, expect, it } from 'vitest';

describe('toolchain', () => {
  it('runs TypeScript unit tests', () => {
    const add = (a: number, b: number): number => a + b;
    expect(add(2, 3)).toBe(5);
  });
});
