import { describe, expect, it } from 'vitest';
import { GRAVITY_MS, LINE_CLEAR_MS, LOCK_DELAY_MS } from './constants';
import { createGame, type Game } from './game';
import {
  activeCells,
  at,
  boardFromRows,
  boardWith,
  filledCells,
  fixedSequence,
  tap,
  translate,
} from './testing';

// GRAVITY_MS lists the fall intervals for level 1, 2, 3, ...
const LEVEL_1_GRAVITY_MS = GRAVITY_MS[0] ?? Number.NaN;

/** Much longer than anything the game waits for. */
const LONG_PAUSE_MS = 10_000;

function newGame(): Game {
  return createGame({ sequence: fixedSequence(['T', 'O']) });
}

describe('A23 pause', () => {
  it('pauses a running game', () => {
    const game = newGame();
    game.pause();
    expect(game.state.status).toBe('paused');
  });

  it('stops time while paused', () => {
    const game = newGame();
    const before = activeCells(game);
    game.pause();
    game.update(LONG_PAUSE_MS);
    expect(activeCells(game)).toEqual(before);
  });

  it('ignores game keys while paused', () => {
    const game = newGame();
    const before = activeCells(game);
    game.pause();
    for (const action of ['left', 'right', 'rotateCW', 'rotateCCW', 'softDrop', 'hardDrop'] as const) {
      tap(game, action);
    }
    expect(activeCells(game)).toEqual(before);
    expect(game.state.score).toBe(0);
  });

  it('continues the fall step exactly where it stopped', () => {
    const game = newGame();
    const before = activeCells(game);
    game.update(LEVEL_1_GRAVITY_MS - 100);
    game.pause();
    game.update(LONG_PAUSE_MS);
    game.resume();
    expect(game.state.status).toBe('playing');
    game.update(99);
    expect(activeCells(game)).toEqual(before);
    game.update(1);
    expect(activeCells(game)).toEqual(translate(before, 0, 1));
  });

  it('continues the lock delay exactly where it stopped', () => {
    // The T rests on the block below its centre right after spawning.
    const game = createGame({ sequence: fixedSequence(['T', 'O']), board: boardWith([at(5, 3)]) });
    game.update(LOCK_DELAY_MS - 100);
    game.pause();
    game.update(LONG_PAUSE_MS);
    game.resume();
    game.update(99);
    expect(game.state.active?.type).toBe('T');
    game.update(1);
    // The T locks: its four cells join the block below it on the board.
    expect(filledCells(game.state.board)).toHaveLength(5);
  });

  it('continues the line clear animation exactly where it stopped (A16)', () => {
    // The horizontal bar completes the bottom row with a hard drop.
    const game = createGame({ sequence: fixedSequence(['I', 'O']), board: boardFromRows(['JJJ....JJJ']) });
    tap(game, 'hardDrop');
    game.update(100);
    game.pause();
    game.update(LONG_PAUSE_MS);
    game.resume();
    game.update(LINE_CLEAR_MS - 101);
    expect(game.state.active).toBeNull();
    game.update(1);
    expect(game.state.active?.type).toBe('O');
  });

  it('does not pause a game that has ended', () => {
    // The square cannot appear because a block lies in its spawn cells (A5).
    const game = createGame({ sequence: fixedSequence(['O']), board: boardWith([at(5, 1)]) });
    expect(game.state.status).toBe('gameOver');
    game.pause();
    expect(game.state.status).toBe('gameOver');
  });
});

describe('A25 giving up', () => {
  it('ends a paused game and keeps its values', () => {
    const game = newGame();
    tap(game, 'hardDrop');
    const { score, lines, level } = game.state;
    expect(score).toBeGreaterThan(0);
    game.pause();
    game.giveUp();
    expect(game.state.status).toBe('gameOver');
    expect(game.state.score).toBe(score);
    expect(game.state.lines).toBe(lines);
    expect(game.state.level).toBe(level);
  });

  it('does not continue a game after giving up', () => {
    const game = newGame();
    game.pause();
    game.giveUp();
    game.resume();
    expect(game.state.status).toBe('gameOver');
  });
});
