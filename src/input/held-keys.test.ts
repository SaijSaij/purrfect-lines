import { describe, expect, it } from 'vitest';
import { HeldKeys } from './held-keys';

// Keys are given as KeyboardEvent.code values (physical keys).
describe('held keys', () => {
  it('reports a new key press', () => {
    const keys = new HeldKeys<string>();
    expect(keys.down('ArrowLeft', 'left')).toBe(true);
  });

  it('reports a second key for the same action as a new press', () => {
    const keys = new HeldKeys<string>();
    keys.down('ArrowUp', 'rotateCW');
    expect(keys.down('KeyX', 'rotateCW')).toBe(true);
  });

  it('ignores the key repeat of the operating system', () => {
    const keys = new HeldKeys<string>();
    keys.down('ArrowLeft', 'left');
    expect(keys.down('ArrowLeft', 'left')).toBe(false);
  });

  it('releases the action with its last key', () => {
    const keys = new HeldKeys<string>();
    keys.down('ArrowLeft', 'left');
    keys.down('KeyA', 'left');
    expect(keys.up('KeyA')).toBeNull();
    expect(keys.up('ArrowLeft')).toBe('left');
  });

  it('ignores the release of a key that is not held', () => {
    const keys = new HeldKeys<string>();
    expect(keys.up('KeyA')).toBeNull();
  });

  it('releases every held action once when all keys are let go at once', () => {
    const keys = new HeldKeys<string>();
    keys.down('ArrowLeft', 'left');
    keys.down('KeyA', 'left');
    keys.down('KeyS', 'softDrop');
    expect(keys.releaseAll().sort()).toEqual(['left', 'softDrop']);
    expect(keys.releaseAll()).toEqual([]);
    expect(keys.down('ArrowLeft', 'left')).toBe(true);
  });
});
