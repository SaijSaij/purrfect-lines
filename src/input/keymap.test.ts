import { describe, expect, it } from 'vitest';
import { actionForKey } from './keymap';

// Keys are given as KeyboardEvent.key values.
describe('A21 key mapping', () => {
  it('maps the arrow keys', () => {
    expect(actionForKey('ArrowLeft')).toBe('left');
    expect(actionForKey('ArrowRight')).toBe('right');
    expect(actionForKey('ArrowDown')).toBe('softDrop');
    expect(actionForKey('ArrowUp')).toBe('rotateCW');
  });

  it('maps X to clockwise rotation, in lower and upper case', () => {
    expect(actionForKey('x')).toBe('rotateCW');
    expect(actionForKey('X')).toBe('rotateCW');
  });

  it('maps the space bar to hard drop', () => {
    expect(actionForKey(' ')).toBe('hardDrop');
  });

  it('maps Enter to confirm', () => {
    expect(actionForKey('Enter')).toBe('confirm');
  });

  it('ignores keys the game does not use', () => {
    expect(actionForKey('Tab')).toBeNull();
    expect(actionForKey('F5')).toBeNull();
    expect(actionForKey('1')).toBeNull();
  });
});

describe('A21 key mapping for all game keys', () => {
  it('maps A, D and S like the left, right and down arrows', () => {
    for (const key of ['a', 'A']) expect(actionForKey(key)).toBe('left');
    for (const key of ['d', 'D']) expect(actionForKey(key)).toBe('right');
    for (const key of ['s', 'S']) expect(actionForKey(key)).toBe('softDrop');
  });

  it('maps W to clockwise rotation, in lower and upper case', () => {
    expect(actionForKey('w')).toBe('rotateCW');
    expect(actionForKey('W')).toBe('rotateCW');
  });

  it('maps Q and Y to counter-clockwise rotation, in lower and upper case', () => {
    for (const key of ['q', 'Q', 'y', 'Y']) expect(actionForKey(key)).toBe('rotateCCW');
  });

  it('recognises letters by the typed character, so Z is not Y', () => {
    expect(actionForKey('z')).toBeNull();
    expect(actionForKey('Z')).toBeNull();
  });
});
