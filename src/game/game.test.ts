import { describe, expect, it } from 'vitest';
import type { Board } from './board';
import { GRAVITY_MS, SOFT_DROP_FACTOR } from './constants';
import { createGame, type Game } from './game';
import { pieceCells, PIECE_TYPES, type PieceType } from './pieces';
import { createPieceSequence } from './sequence';
import {
  activeCells,
  advanceUntil,
  at,
  boardFromRows,
  boardWith,
  filledCells,
  fixedSequence,
  sortPoints,
  tap,
  translate,
  type Point,
} from './testing';

// GRAVITY_MS lists the fall intervals for level 1, 2, 3, ...
const LEVEL_1_GRAVITY_MS = GRAVITY_MS[0] ?? Number.NaN;

function newGame(pieces: readonly PieceType[], board?: Board): Game {
  return createGame({ sequence: fixedSequence(pieces), board });
}

function activePiece(game: Game): NonNullable<Game['state']['active']> {
  const piece = game.state.active;
  if (piece === null) throw new Error('No falling piece');
  return piece;
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

// Spawn cells in spec coordinates (A4).
const SPAWN: Record<PieceType, Point[]> = {
  I: [at(4, 1), at(5, 1), at(6, 1), at(7, 1)],
  O: [at(5, 1), at(6, 1), at(5, 2), at(6, 2)],
  T: [at(5, 1), at(4, 2), at(5, 2), at(6, 2)],
  S: [at(5, 1), at(6, 1), at(4, 2), at(5, 2)],
  Z: [at(4, 1), at(5, 1), at(5, 2), at(6, 2)],
  L: [at(6, 1), at(4, 2), at(5, 2), at(6, 2)],
  J: [at(4, 1), at(4, 2), at(5, 2), at(6, 2)],
};

describe('game start', () => {
  it('starts on level 1 with an empty board and a falling piece', () => {
    const game = createGame({ seed: 1 });
    expect(game.state.status).toBe('playing');
    expect(game.state.level).toBe(1);
    expect(filledCells(game.state.board)).toEqual([]);
    expect(game.state.active).not.toBeNull();
  });

  it('takes its pieces from the seeded sequence (A3)', () => {
    const expected = createPieceSequence(7);
    const game = createGame({ seed: 7 });
    expect(activePiece(game).type).toBe(expected.next());
    expect(game.state.next).toBe(expected.next());
  });

  it('shows the piece that comes next (A43)', () => {
    const game = newGame(['T', 'S', 'Z']);
    expect(game.state.next).toBe('S');
    tap(game, 'hardDrop');
    expect(activePiece(game).type).toBe('S');
    expect(game.state.next).toBe('Z');
  });
});

describe('A4 spawning', () => {
  for (const type of PIECE_TYPES) {
    it(`${type} appears in spawn state centred at the top`, () => {
      const game = newGame([type]);
      expect(activePiece(game).rotation).toBe(0);
      expect(activeCells(game)).toEqual(sortPoints(SPAWN[type]));
    });
  }
});

describe('A5 game over', () => {
  it('ends when a new piece overlaps blocks and keeps the piece out of the board', () => {
    const board = boardWith([at(5, 1)]);
    const game = newGame(['T'], board);
    expect(game.state.status).toBe('gameOver');
    expect(game.state.board).toEqual(board);
  });

  it('ends when a piece locks with a block above row 1', () => {
    // Column 6 is filled from row 4 down, so a vertical bar rests in rows 0–3.
    const board = boardWith(range(4, 20).map((row) => at(6, row)));
    const game = newGame(['I', 'O'], board);
    tap(game, 'rotateCW');
    expect(activeCells(game)).toEqual(sortPoints([at(6, 0), at(6, 1), at(6, 2), at(6, 3)]));
    tap(game, 'hardDrop');
    expect(game.state.status).toBe('gameOver');
  });

  it('keeps playing when a piece locks completely inside the field', () => {
    const game = newGame(['T', 'O']);
    tap(game, 'hardDrop');
    expect(game.state.status).toBe('playing');
  });

  it('ignores time and input after the game has ended', () => {
    const board = boardWith([at(5, 1)]);
    const game = newGame(['T'], board);
    game.update(10_000);
    tap(game, 'left');
    tap(game, 'hardDrop');
    expect(game.state.status).toBe('gameOver');
    expect(game.state.board).toEqual(board);
  });
});

describe('A6 moving sideways', () => {
  it('moves one column left and right per tap', () => {
    const game = newGame(['T']);
    const start = activeCells(game);
    tap(game, 'left');
    expect(activeCells(game)).toEqual(translate(start, -1, 0));
    tap(game, 'right');
    tap(game, 'right');
    expect(activeCells(game)).toEqual(translate(start, 1, 0));
  });

  it('stops at the left wall', () => {
    const game = newGame(['T']);
    const start = activeCells(game);
    for (let i = 0; i < 3; i++) tap(game, 'left');
    expect(activeCells(game)).toEqual(translate(start, -3, 0));
    tap(game, 'left');
    expect(activeCells(game)).toEqual(translate(start, -3, 0));
  });

  it('stops at the right wall', () => {
    const game = newGame(['T']);
    const start = activeCells(game);
    for (let i = 0; i < 4; i++) tap(game, 'right');
    expect(activeCells(game)).toEqual(translate(start, 4, 0));
    tap(game, 'right');
    expect(activeCells(game)).toEqual(translate(start, 4, 0));
  });

  it('does not move into blocks', () => {
    const game = newGame(['T'], boardWith([at(3, 2), at(7, 2)]));
    const start = activeCells(game);
    tap(game, 'left');
    expect(activeCells(game)).toEqual(start);
    tap(game, 'right');
    expect(activeCells(game)).toEqual(start);
  });
});

describe('A8 rotating clockwise', () => {
  it('rotates the T clockwise around the centre of its box', () => {
    const game = newGame(['T']);
    tap(game, 'rotateCW');
    expect(activeCells(game)).toEqual(sortPoints([at(5, 1), at(5, 2), at(6, 2), at(5, 3)]));
  });

  for (const type of PIECE_TYPES) {
    it(`${type} goes through all four states in a free field and back to the start`, () => {
      const game = newGame([type]);
      for (let i = 0; i < 3; i++) game.update(LEVEL_1_GRAVITY_MS);
      const { x, y } = activePiece(game);
      const start = activeCells(game);
      for (const rotation of [1, 2, 3] as const) {
        tap(game, 'rotateCW');
        expect(activeCells(game)).toEqual(translate(pieceCells(type, rotation), x, y));
      }
      tap(game, 'rotateCW');
      expect(activeCells(game)).toEqual(start);
    });
  }

  it('does not change the square', () => {
    const game = newGame(['O']);
    const start = activeCells(game);
    tap(game, 'rotateCW');
    expect(activeCells(game)).toEqual(start);
  });

  it('rotates only once per key press, even when the press repeats', () => {
    const game = newGame(['T']);
    game.press('rotateCW');
    game.press('rotateCW'); // operating system key repeat
    game.update(LEVEL_1_GRAVITY_MS - 1);
    expect(activePiece(game).rotation).toBe(1);
    game.release('rotateCW');
    expect(activePiece(game).rotation).toBe(1);
  });
});

describe('A10 gravity on level 1', () => {
  it('falls one row after GRAVITY_MS for level 1, not earlier', () => {
    const game = newGame(['T']);
    const start = activeCells(game);
    game.update(LEVEL_1_GRAVITY_MS - 1);
    expect(activeCells(game)).toEqual(start);
    game.update(1);
    expect(activeCells(game)).toEqual(translate(start, 0, 1));
  });

  it('adds up time over several updates', () => {
    const game = newGame(['T']);
    const start = activeCells(game);
    game.update(LEVEL_1_GRAVITY_MS / 2);
    game.update(LEVEL_1_GRAVITY_MS / 2);
    game.update(LEVEL_1_GRAVITY_MS / 2);
    expect(activeCells(game)).toEqual(translate(start, 0, 1));
    game.update(LEVEL_1_GRAVITY_MS / 2);
    expect(activeCells(game)).toEqual(translate(start, 0, 2));
  });

  it('locks a resting piece eventually and spawns the next one', () => {
    const game = newGame(['O', 'T']);
    advanceUntil(game, () => filledCells(game.state.board).length > 0);
    expect(filledCells(game.state.board)).toEqual(
      sortPoints([at(5, 19), at(6, 19), at(5, 20), at(6, 20)]),
    );
    expect(activePiece(game).type).toBe('T');
  });
});

describe('A11 soft drop', () => {
  const softDropMs = LEVEL_1_GRAVITY_MS / SOFT_DROP_FACTOR;

  it('falls one row per GRAVITY_MS / SOFT_DROP_FACTOR while held', () => {
    const game = newGame(['T']);
    game.press('softDrop');
    const startY = activePiece(game).y;
    for (let i = 1; i <= 5; i++) {
      game.update(softDropMs);
      expect(activePiece(game).y).toBe(startY + i);
    }
  });

  it('falls only one row per interval when pressed late in a gravity step', () => {
    const game = newGame(['T']);
    game.update(LEVEL_1_GRAVITY_MS - 1);
    const startY = activePiece(game).y;
    game.press('softDrop');
    game.update(softDropMs);
    expect(activePiece(game).y).toBe(startY + 1);
  });

  it('falls at normal speed again after release', () => {
    const game = newGame(['T']);
    game.press('softDrop');
    game.update(softDropMs);
    game.update(softDropMs);
    game.release('softDrop');
    const y = activePiece(game).y;
    game.update(softDropMs);
    game.update(softDropMs);
    expect(activePiece(game).y).toBe(y);
  });
});

describe('A12 hard drop', () => {
  it('drops to the floor and locks at once', () => {
    const game = newGame(['T', 'O']);
    tap(game, 'hardDrop');
    expect(filledCells(game.state.board)).toEqual(
      sortPoints([at(5, 19), at(4, 20), at(5, 20), at(6, 20)]),
    );
    expect(activePiece(game).type).toBe('O');
    expect(activeCells(game)).toEqual(sortPoints(SPAWN.O));
  });

  it('stops on top of blocks', () => {
    const game = newGame(['T', 'O'], boardWith([at(5, 15)]));
    tap(game, 'hardDrop');
    expect(filledCells(game.state.board)).toEqual(
      sortPoints([at(5, 13), at(4, 14), at(5, 14), at(6, 14), at(5, 15)]),
    );
  });

  it('drops only once while the key is held', () => {
    const game = newGame(['T', 'O']);
    game.press('hardDrop');
    game.press('hardDrop'); // operating system key repeat
    game.update(100);
    expect(filledCells(game.state.board)).toHaveLength(4);
    expect(activeCells(game)).toEqual(sortPoints(SPAWN.O));
  });
});

describe('A15 clearing rows during play', () => {
  it('removes a row completed by a piece and moves the rest down', () => {
    const board = boardFromRows(['J.........', 'JJJ....JJJ']);
    const game = newGame(['I', 'O'], board);
    tap(game, 'hardDrop');
    advanceUntil(game, () => game.state.active !== null);
    expect(filledCells(game.state.board)).toEqual([at(1, 20)]);
  });
});

describe('A11 tapping soft drop', () => {
  it('does not hold the piece in the air when tapped faster than the soft drop interval', () => {
    const game = newGame(['T']);
    const startY = activePiece(game).y;
    const tapMs = LEVEL_1_GRAVITY_MS / SOFT_DROP_FACTOR / 5;
    // Short taps of soft drop, each shorter than one soft drop step, for two gravity steps.
    for (let elapsed = 0; elapsed < 2 * LEVEL_1_GRAVITY_MS; elapsed += 2 * tapMs) {
      game.press('softDrop');
      game.update(tapMs);
      game.release('softDrop');
      game.update(tapMs);
    }
    expect(activePiece(game).y).toBeGreaterThanOrEqual(startY + 2);
  });
});
