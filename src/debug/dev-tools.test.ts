import { afterEach, describe, expect, it, vi } from 'vitest';
import { GRAVITY_MS, REPEAT_DELAY_MS } from '../game/constants';
import { createGame, type Game } from '../game/game';
import { activeCells, fixedSequence, translate } from '../game/testing';
import { levelFromUrl, slowFromUrl, slowMotion } from './dev-tools';

const LEVEL_1_GRAVITY_MS = GRAVITY_MS[0] ?? Number.NaN;

afterEach(() => {
  vi.restoreAllMocks();
});

function silencedWarnings() {
  return vi.spyOn(console, 'warn').mockImplementation(() => undefined);
}

function newGame(): Game {
  return createGame({ sequence: fixedSequence(['T']) });
}

describe('A40 start level from the URL', () => {
  it('reads ?level from 1 to 99', () => {
    expect(levelFromUrl('?level=1')).toBe(1);
    expect(levelFromUrl('?level=15')).toBe(15);
    expect(levelFromUrl('?level=99')).toBe(99);
    expect(levelFromUrl('?seed=3&level=7')).toBe(7);
  });

  it('is undefined without ?level and does not warn', () => {
    const warn = silencedWarnings();
    expect(levelFromUrl('')).toBeUndefined();
    expect(levelFromUrl('?seed=3')).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it('ignores invalid values and reports each in the console', () => {
    const warn = silencedWarnings();
    const invalid = ['0', '100', '-3', '2.5', 'abc', ''];
    for (const raw of invalid) {
      expect(levelFromUrl(`?level=${raw}`), raw).toBeUndefined();
    }
    expect(warn).toHaveBeenCalledTimes(invalid.length);
  });
});

describe('A41 slow motion', () => {
  it('reads ?slow from 1 to 10', () => {
    expect(slowFromUrl('?slow=1')).toBe(1);
    expect(slowFromUrl('?slow=4')).toBe(4);
    expect(slowFromUrl('?slow=10')).toBe(10);
  });

  it('is undefined without ?slow and does not warn', () => {
    const warn = silencedWarnings();
    expect(slowFromUrl('')).toBeUndefined();
    expect(slowFromUrl('?debug')).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it('ignores invalid values and reports each in the console', () => {
    const warn = silencedWarnings();
    const invalid = ['0', '11', '-2', 'abc', ''];
    for (const raw of invalid) {
      expect(slowFromUrl(`?slow=${raw}`), raw).toBeUndefined();
    }
    expect(warn).toHaveBeenCalledTimes(invalid.length);
  });

  it('lets gravity take factor times as long', () => {
    const game = slowMotion(newGame(), 4);
    const start = activeCells(game);
    game.update(4 * LEVEL_1_GRAVITY_MS - 1);
    expect(activeCells(game)).toEqual(start);
    game.update(1);
    expect(activeCells(game)).toEqual(translate(start, 0, 1));
  });

  it('slows the key repeat as well', () => {
    const game = slowMotion(newGame(), 4);
    const start = activeCells(game);
    game.press('left');
    expect(activeCells(game)).toEqual(translate(start, -1, 0));
    game.update(4 * REPEAT_DELAY_MS - 1);
    expect(activeCells(game)).toEqual(translate(start, -1, 0));
    game.update(1);
    expect(activeCells(game)).toEqual(translate(start, -2, 0));
  });
});
