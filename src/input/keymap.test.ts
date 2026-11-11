import { describe, expect, it } from 'vitest';
import { actionForKey, isLanguageKey, menuActionForKey, soundToggleForKey } from './keymap';

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

  it('maps P and Esc to pause (A23)', () => {
    for (const key of ['p', 'P', 'Escape']) expect(actionForKey(key)).toBe('pause');
  });

  it('maps the menu keys: ↑ and W up, ↓ and S down, Enter confirms', () => {
    for (const key of ['ArrowUp', 'w', 'W']) expect(menuActionForKey(key)).toBe('up');
    for (const key of ['ArrowDown', 's', 'S']) expect(menuActionForKey(key)).toBe('down');
    expect(menuActionForKey('Enter')).toBe('confirm');
  });

  it('ignores other keys in menus, e.g. X and Q', () => {
    for (const key of ['x', 'q', ' ', 'ArrowLeft']) expect(menuActionForKey(key)).toBeNull();
  });

  it('recognises letters by the typed character, so Z is not Y', () => {
    expect(actionForKey('z')).toBeNull();
    expect(actionForKey('Z')).toBeNull();
  });
});

describe('A34 keys for sound', () => {
  it('maps M to the music, in lower and upper case', () => {
    expect(soundToggleForKey('m')).toBe('music');
    expect(soundToggleForKey('M')).toBe('music');
  });

  it('maps N to the sounds, in lower and upper case', () => {
    expect(soundToggleForKey('n')).toBe('sounds');
    expect(soundToggleForKey('N')).toBe('sounds');
  });

  it('ignores other keys', () => {
    for (const key of ['p', 'Enter', ' ', 'ArrowUp', 'x']) expect(soundToggleForKey(key)).toBeNull();
  });
});

describe('A38 key for the language', () => {
  it('recognises L, in lower and upper case', () => {
    expect(isLanguageKey('l')).toBe(true);
    expect(isLanguageKey('L')).toBe(true);
  });

  it('ignores other keys', () => {
    for (const key of ['m', 'n', 'Enter', ' ', 'ArrowLeft']) expect(isLanguageKey(key)).toBe(false);
  });
});
