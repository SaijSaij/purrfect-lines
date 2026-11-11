import { describe, expect, it } from 'vitest';
import type { Board } from './board';
import {
  BOARD_HEIGHT,
  GRAVITY_MS,
  HARD_DROP_POINTS,
  LINE_POINTS,
  LINES_PER_LEVEL,
  SOFT_DROP_FACTOR,
  SOFT_DROP_POINTS,
} from './constants';
import { createGame, type Game } from './game';
import type { PieceType } from './pieces';
import { levelFor } from './scoring';
import { activeCells, advanceUntil, boardFromRows, fixedSequence, tap, translate } from './testing';

// GRAVITY_MS lists the fall intervals for level 1, 2, 3, ...
const LEVEL_1_GRAVITY_MS = GRAVITY_MS[0] ?? Number.NaN;
const LEVEL_2_GRAVITY_MS = GRAVITY_MS[1] ?? Number.NaN;
const FASTEST_GRAVITY_MS = GRAVITY_MS[GRAVITY_MS.length - 1] ?? Number.NaN;
const TETRIS_POINTS = LINE_POINTS[3] ?? Number.NaN;

interface Setup {
  board?: Board;
  startLevel?: number;
}

function newGame(pieces: readonly PieceType[], setup: Setup = {}): Game {
  return createGame({ sequence: fixedSequence(pieces), ...setup });
}

/** A board whose bottom rows are full except for column 1. */
function rowsOpenInColumnOne(count: number): Board {
  return boardFromRows(Array<string>(count).fill('.JJJJJJJJJ'));
}

/** Turns the bar upright and moves it into column 1. */
function bringBarToColumnOne(game: Game): void {
  tap(game, 'rotateCW');
  for (let i = 0; i < 5; i++) tap(game, 'left');
}

/**
 * Lets gravity drop the upright bar in column 1 (which gives no points) until
 * it clears rows, then waits for the next piece.
 */
function dropBarIntoColumnOne(game: Game): void {
  bringBarToColumnOne(game);
  const lines = game.state.lines;
  advanceUntil(game, () => game.state.lines !== lines);
  advanceUntil(game, () => game.state.active !== null);
}

describe('A10 gravity on every level', () => {
  it('falls one row after GRAVITY_MS of the level, not earlier', () => {
    GRAVITY_MS.forEach((ms, index) => {
      const game = newGame(['T'], { startLevel: index + 1 });
      const start = activeCells(game);
      game.update(ms - 1);
      expect(activeCells(game), `level ${index + 1}`).toEqual(start);
      game.update(1);
      expect(activeCells(game), `level ${index + 1}`).toEqual(translate(start, 0, 1));
    });
  });

  it('falls no faster beyond the end of the table, e.g. on level 20', () => {
    const game = newGame(['T'], { startLevel: 20 });
    const start = activeCells(game);
    game.update(FASTEST_GRAVITY_MS - 1);
    expect(activeCells(game)).toEqual(start);
    game.update(1);
    expect(activeCells(game)).toEqual(translate(start, 0, 1));
  });

  it('falls faster once the level rises during play', () => {
    const game = newGame(['I'], { board: rowsOpenInColumnOne(LINES_PER_LEVEL) });
    while (game.state.lines < LINES_PER_LEVEL) dropBarIntoColumnOne(game);
    expect(game.state.level).toBe(2);
    // A hard drop spawns the next piece without any time carried over.
    tap(game, 'hardDrop');
    const start = activeCells(game);
    game.update(LEVEL_2_GRAVITY_MS - 1);
    expect(activeCells(game)).toEqual(start);
    game.update(1);
    expect(activeCells(game)).toEqual(translate(start, 0, 1));
  });
});

describe('A11 soft drop points', () => {
  it('gives SOFT_DROP_POINTS for every row fallen by soft drop', () => {
    const game = newGame(['T']);
    game.press('softDrop');
    for (let i = 0; i < 5; i++) game.update(LEVEL_1_GRAVITY_MS / SOFT_DROP_FACTOR);
    expect(game.state.score).toBe(5 * SOFT_DROP_POINTS);
  });

  it('does not multiply soft drop points by the level', () => {
    const game = newGame(['T'], { startLevel: 3 });
    const softDropMs = (GRAVITY_MS[2] ?? Number.NaN) / SOFT_DROP_FACTOR;
    game.press('softDrop');
    for (let i = 0; i < 5; i++) game.update(softDropMs);
    expect(game.state.score).toBe(5 * SOFT_DROP_POINTS);
  });

  it('gives no points for rows fallen by gravity', () => {
    const game = newGame(['T']);
    for (let i = 0; i < 5; i++) game.update(LEVEL_1_GRAVITY_MS);
    expect(game.state.score).toBe(0);
  });
});

describe('A12 hard drop points', () => {
  // The T spawns in rows 1–2 and lands in the two bottom rows.
  const ROWS_FROM_SPAWN_TO_FLOOR = BOARD_HEIGHT - 2;

  it('gives HARD_DROP_POINTS for every row skipped', () => {
    const game = newGame(['T', 'O']);
    tap(game, 'hardDrop');
    expect(game.state.score).toBe(ROWS_FROM_SPAWN_TO_FLOOR * HARD_DROP_POINTS);
  });

  it('counts only the rows skipped and does not multiply by the level', () => {
    const game = newGame(['T', 'O'], { startLevel: 3 });
    const gravityMs = GRAVITY_MS[2] ?? Number.NaN;
    for (let i = 0; i < 3; i++) game.update(gravityMs);
    tap(game, 'hardDrop');
    expect(game.state.score).toBe((ROWS_FROM_SPAWN_TO_FLOOR - 3) * HARD_DROP_POINTS);
  });
});

describe('A17 points for cleared rows', () => {
  for (const level of [1, 3]) {
    for (const rows of [1, 2, 3, 4]) {
      it(`${rows} row(s) at once on level ${level} give LINE_POINTS × level`, () => {
        const game = newGame(['I', 'I'], { board: rowsOpenInColumnOne(rows), startLevel: level });
        dropBarIntoColumnOne(game);
        expect(game.state.lines).toBe(rows);
        expect(game.state.score).toBe((LINE_POINTS[rows - 1] ?? Number.NaN) * level);
      });
    }
  }

  it('adds hard drop points without the level factor', () => {
    const game = newGame(['I', 'I'], { board: rowsOpenInColumnOne(4), startLevel: 3 });
    bringBarToColumnOne(game);
    // The upright bar spans rows 0–3 (one above the field) and lands in rows 17–20.
    const skippedRows = BOARD_HEIGHT - 3;
    tap(game, 'hardDrop');
    expect(game.state.score).toBe(TETRIS_POINTS * 3 + skippedRows * HARD_DROP_POINTS);
  });

  it('uses the level before the clear when the clear raises the level', () => {
    const bars = Math.ceil(LINES_PER_LEVEL / 4);
    const game = newGame(['I'], { board: rowsOpenInColumnOne(4 * bars) });
    while (game.state.lines + 4 < LINES_PER_LEVEL) dropBarIntoColumnOne(game);
    const { score, level } = game.state;
    expect(level).toBe(1);
    dropBarIntoColumnOne(game);
    expect(game.state.level).toBe(2);
    expect(game.state.score - score).toBe(TETRIS_POINTS * 1);
  });
});

describe('A18 level', () => {
  it('rises by one every LINES_PER_LEVEL cleared rows', () => {
    expect(levelFor(0, 1)).toBe(1);
    expect(levelFor(LINES_PER_LEVEL - 1, 1)).toBe(1);
    expect(levelFor(LINES_PER_LEVEL, 1)).toBe(2);
    expect(levelFor(2 * LINES_PER_LEVEL - 1, 1)).toBe(2);
    expect(levelFor(2 * LINES_PER_LEVEL, 1)).toBe(3);
  });

  it('counts from the start level (A40)', () => {
    expect(levelFor(0, 5)).toBe(5);
    expect(levelFor(LINES_PER_LEVEL, 5)).toBe(6);
  });

  it('has no maximum', () => {
    expect(levelFor(1000 * LINES_PER_LEVEL, 1)).toBe(1001);
  });

  it('counts rows cleared at once together', () => {
    // As in the spec example: 8 rows, then 4 at once give 12 rows and level 2.
    const bars = Math.ceil(LINES_PER_LEVEL / 4);
    const game = newGame(['I'], { board: rowsOpenInColumnOne(4 * bars) });
    for (let i = 0; i < bars; i++) dropBarIntoColumnOne(game);
    expect(game.state.lines).toBe(4 * bars);
    expect(game.state.level).toBe(2);
  });
});

describe('A40 start level in the game', () => {
  it('starts the game on the start level', () => {
    const game = newGame(['T'], { startLevel: 5 });
    expect(game.state.level).toBe(5);
  });
});
