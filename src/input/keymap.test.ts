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
