import { describe, expect, it } from 'vitest';
import type { Board } from './board';
import {
  GRAVITY_MS,
  LOCK_DELAY_MS,
  LOCK_RESETS_MAX,
  REPEAT_DELAY_MS,
  REPEAT_INTERVAL_MS,
} from './constants';
import { createGame, type Game } from './game';
import { pieceCells, PIECE_TYPES, type PieceType } from './pieces';
import {
  activeCells,
  advanceUntil,
  at,
  boardFromRows,
  boardWith,
  filledCells,
  fixedSequence,
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

/** Lets the piece fall the given number of rows by gravity. */
function fall(game: Game, rows: number): void {
  for (let i = 0; i < rows; i++) game.update(LEVEL_1_GRAVITY_MS);
}

function blockCount(game: Game): number {
  return filledCells(game.state.board).length;
}

/** Board cells of a piece in the given state with its rotation box at (x, y). */
function cellsAt(type: PieceType, rotation: 0 | 1 | 2 | 3, x: number, y: number): Point[] {
  return translate(pieceCells(type, rotation), x, y);
}

function repeat(times: number, action: () => void): void {
  for (let i = 0; i < times; i++) action();
}

// The T spawns with its rotation box in columns 4–6 (x = 3), so it can move
// three columns to the left and four to the right.
describe('A7 key repeat', () => {
  it('moves once at once, again after REPEAT_DELAY_MS, then every REPEAT_INTERVAL_MS', () => {
    const game = newGame(['T']);
    game.press('right');
    expect(activePiece(game).x).toBe(4);
    game.update(REPEAT_DELAY_MS - 1);
    expect(activePiece(game).x).toBe(4);
    game.update(1);
    expect(activePiece(game).x).toBe(5);
    game.update(REPEAT_INTERVAL_MS - 1);
    expect(activePiece(game).x).toBe(5);
    game.update(1);
    expect(activePiece(game).x).toBe(6);
    game.update(REPEAT_INTERVAL_MS);
    expect(activePiece(game).x).toBe(7);
  });

  it('makes up for all repeats within one long update', () => {
    const game = newGame(['T']);
    game.press('right');
    game.update(REPEAT_DELAY_MS + 2 * REPEAT_INTERVAL_MS);
    expect(activePiece(game).x).toBe(7);
  });

  it('stops repeating when the key is released', () => {
    const game = newGame(['T']);
    game.press('right');
    game.update(REPEAT_DELAY_MS);
    expect(activePiece(game).x).toBe(5);
    game.release('right');
    game.update(REPEAT_DELAY_MS);
    expect(activePiece(game).x).toBe(5);
  });

  it('ignores the key repeat of the operating system', () => {
    const game = newGame(['T']);
    game.press('right');
    game.update(REPEAT_DELAY_MS - REPEAT_INTERVAL_MS);
    game.press('right'); // operating system key repeat
    expect(activePiece(game).x).toBe(4);
    game.update(REPEAT_INTERVAL_MS);
    expect(activePiece(game).x).toBe(5);
  });

  it('follows the direction pressed last when both are held', () => {
    const game = newGame(['T']);
    game.press('left');
    expect(activePiece(game).x).toBe(2);
    game.press('right');
    expect(activePiece(game).x).toBe(3);
    game.update(REPEAT_DELAY_MS);
    expect(activePiece(game).x).toBe(4);
    game.update(REPEAT_INTERVAL_MS);
    expect(activePiece(game).x).toBe(5);
  });

  it('returns to the other direction with a new delay when the last one is released', () => {
    const game = newGame(['T']);
    game.press('left');
    game.press('right');
    game.update(REPEAT_DELAY_MS);
    expect(activePiece(game).x).toBe(4);
    game.release('right');
    expect(activePiece(game).x).toBe(4);
    game.update(REPEAT_DELAY_MS - 1);
    expect(activePiece(game).x).toBe(4);
    game.update(1);
    expect(activePiece(game).x).toBe(3);
    game.update(REPEAT_INTERVAL_MS);
    expect(activePiece(game).x).toBe(2);
  });

  it('keeps repeating the last direction when the earlier one is released', () => {
    const game = newGame(['T']);
    game.press('left');
    game.press('right');
    game.release('left');
    game.update(REPEAT_DELAY_MS);
    expect(activePiece(game).x).toBe(4);
  });
});

describe('A8 rotating counter-clockwise', () => {
  it('turns the T into state L', () => {
    const game = newGame(['T']);
    const { x, y } = activePiece(game);
    tap(game, 'rotateCCW');
    expect(activePiece(game).rotation).toBe(3);
    expect(activeCells(game)).toEqual(cellsAt('T', 3, x, y));
  });

  it('undoes a clockwise rotation', () => {
    const game = newGame(['T']);
    const start = activeCells(game);
    tap(game, 'rotateCW');
    tap(game, 'rotateCCW');
    expect(activePiece(game).rotation).toBe(0);
    expect(activeCells(game)).toEqual(start);
  });

  for (const type of PIECE_TYPES) {
    it(`${type} goes through L, 2, R in a free field and back to the start`, () => {
      const game = newGame([type]);
      fall(game, 3);
      const { x, y } = activePiece(game);
      const start = activeCells(game);
      for (const rotation of [3, 2, 1] as const) {
        tap(game, 'rotateCCW');
        expect(activeCells(game)).toEqual(cellsAt(type, rotation, x, y));
      }
      tap(game, 'rotateCCW');
      expect(activeCells(game)).toEqual(start);
    });
  }

  it('does not change the square', () => {
    const game = newGame(['O']);
    const start = activeCells(game);
    tap(game, 'rotateCCW');
    expect(activeCells(game)).toEqual(start);
  });

  it('rotates only once per key press, even when the press repeats', () => {
    const game = newGame(['T']);
    game.press('rotateCCW');
    game.press('rotateCCW'); // operating system key repeat
    game.update(LEVEL_1_GRAVITY_MS - 1);
    expect(activePiece(game).rotation).toBe(3);
    game.release('rotateCCW');
    expect(activePiece(game).rotation).toBe(3);
  });
});

// Kick offsets in A9 count y upwards; on the board y grows downwards.
describe('A9 wall kicks', () => {
  // After three rows of falling the bar's box is at y = 2. In state R its
  // blocks are in box column 2, in state L in box column 1.
  it('turns a vertical bar at the left wall clockwise into a horizontal one (R→2, test 3)', () => {
    const game = newGame(['I']);
    fall(game, 3);
    tap(game, 'rotateCW');
    repeat(10, () => tap(game, 'left'));
    expect(activePiece(game).x).toBe(-2);
    tap(game, 'rotateCW');
    expect(activePiece(game).rotation).toBe(2);
    expect(activeCells(game)).toEqual(cellsAt('I', 2, 0, 2));
  });

  it('turns a vertical bar at the right wall counter-clockwise into a horizontal one (R→0, test 3)', () => {
    const game = newGame(['I']);
    fall(game, 3);
    tap(game, 'rotateCW');
    repeat(10, () => tap(game, 'right'));
    expect(activePiece(game).x).toBe(7);
    tap(game, 'rotateCCW');
    expect(activePiece(game).rotation).toBe(0);
    expect(activeCells(game)).toEqual(cellsAt('I', 0, 6, 2));
  });

  it('turns a vertical bar at the left wall clockwise into a horizontal one (L→0, test 2)', () => {
    const game = newGame(['I']);
    fall(game, 3);
    tap(game, 'rotateCCW');
    repeat(10, () => tap(game, 'left'));
    expect(activePiece(game).x).toBe(-1);
    tap(game, 'rotateCW');
    expect(activePiece(game).rotation).toBe(0);
    expect(activeCells(game)).toEqual(cellsAt('I', 0, 0, 2));
  });

  it('turns a vertical bar at the right wall counter-clockwise into a horizontal one (L→2, test 2)', () => {
    const game = newGame(['I']);
    fall(game, 3);
    tap(game, 'rotateCCW');
    repeat(10, () => tap(game, 'right'));
    expect(activePiece(game).x).toBe(8);
    tap(game, 'rotateCCW');
    expect(activePiece(game).rotation).toBe(2);
    expect(activeCells(game)).toEqual(cellsAt('I', 2, 6, 2));
  });

  // The T falls eight rows (box at x = 3, y = 8) and rests on two blocks in
  // row 11. They block tests 1 and 2, so test 3 lifts the T by one row.
  it('a resting T takes test 3 when rotating clockwise (0→R, one left and one up)', () => {
    const game = newGame(['T'], boardWith([at(4, 11), at(5, 11)]));
    fall(game, 8);
    expect(activePiece(game).y).toBe(8);
    tap(game, 'rotateCW');
    expect(activePiece(game).rotation).toBe(1);
    expect(activeCells(game)).toEqual(cellsAt('T', 1, 2, 7));
  });

  it('a resting T takes test 3 when rotating counter-clockwise (0→L, one right and one up)', () => {
    const game = newGame(['T'], boardWith([at(5, 11), at(6, 11)]));
    fall(game, 8);
    expect(activePiece(game).y).toBe(8);
    tap(game, 'rotateCCW');
    expect(activePiece(game).rotation).toBe(3);
    expect(activeCells(game)).toEqual(cellsAt('T', 3, 4, 7));
  });

  it('leaves the piece unchanged when no test fits', () => {
    // Only the cells of the spawned T are free in rows 1 and 2, everything
    // below is filled except the right column.
    const board = boardFromRows([
      'JJJJ.JJJJJ',
      'JJJ...JJJJ',
      ...Array<string>(18).fill('JJJJJJJJJ.'),
    ]);
    const game = newGame(['T'], board);
    const start = activeCells(game);
    tap(game, 'rotateCW');
    expect(activePiece(game).rotation).toBe(0);
    expect(activeCells(game)).toEqual(start);
    tap(game, 'rotateCCW');
    expect(activePiece(game).rotation).toBe(0);
    expect(activeCells(game)).toEqual(start);
  });
});

describe('A13 lock delay', () => {
  // Rows 5–20 are filled except the right column. The T (box at x = 3) lands
  // after falling two rows (box at y = 2) and rests on row 5.
  const FLOOR = Array<string>(16).fill('JJJJJJJJJ.');
  const FLOOR_BLOCKS = 16 * 9;

  function landedT(): Game {
    const game = newGame(['T', 'O'], boardFromRows(FLOOR));
    fall(game, 2);
    expect(activePiece(game).y).toBe(2);
    return game;
  }

  it('locks a resting piece after LOCK_DELAY_MS, not earlier', () => {
    const game = landedT();
    game.update(LOCK_DELAY_MS - 1);
    expect(activePiece(game).type).toBe('T');
    expect(blockCount(game)).toBe(FLOOR_BLOCKS);
    game.update(1);
    expect(blockCount(game)).toBe(FLOOR_BLOCKS + 4);
    expect(activePiece(game).type).toBe('O');
  });

  it('restarts the delay after a successful move', () => {
    const game = landedT();
    game.update(LOCK_DELAY_MS - 1);
    tap(game, 'right');
    game.update(LOCK_DELAY_MS - 1);
    expect(blockCount(game)).toBe(FLOOR_BLOCKS);
    game.update(1);
    expect(blockCount(game)).toBe(FLOOR_BLOCKS + 4);
  });

  it('restarts the delay after a successful rotation', () => {
    const game = landedT();
    game.update(LOCK_DELAY_MS - 1);
    tap(game, 'rotateCW');
    expect(activePiece(game).rotation).toBe(1);
    game.update(LOCK_DELAY_MS - 1);
    expect(blockCount(game)).toBe(FLOOR_BLOCKS);
    game.update(1);
    expect(blockCount(game)).toBe(FLOOR_BLOCKS + 4);
  });

  it('does not restart the delay after a move that is blocked', () => {
    const game = newGame(['T', 'O'], boardFromRows(FLOOR));
    repeat(3, () => tap(game, 'left'));
    fall(game, 2);
    game.update(LOCK_DELAY_MS - 1);
    tap(game, 'left'); // the wall blocks the move
    game.update(1);
    expect(blockCount(game)).toBe(FLOOR_BLOCKS + 4);
  });

  it('does not lock earlier while soft drop is held', () => {
    const game = landedT();
    game.press('softDrop');
    game.update(LOCK_DELAY_MS - 1);
    expect(blockCount(game)).toBe(FLOOR_BLOCKS);
    game.update(1);
    expect(blockCount(game)).toBe(FLOOR_BLOCKS + 4);
  });

  it('keeps a resting piece alive through gravity steps while moves restart the delay', () => {
    const game = landedT();
    repeat(4, () => {
      game.update(LOCK_DELAY_MS - 1);
      tap(game, 'right');
      game.update(LOCK_DELAY_MS - 1);
      tap(game, 'left');
    });
    expect(activePiece(game).type).toBe('T');
    expect(blockCount(game)).toBe(FLOOR_BLOCKS);
  });

  it('locks at once after LOCK_RESETS_MAX restarts when the piece moves on the ground again', () => {
    const game = landedT();
    // Each restart keeps the piece alive (box alternating between x = 2 and 3).
    for (let i = 0; i < LOCK_RESETS_MAX; i++) {
      game.update(LOCK_DELAY_MS - 1);
      tap(game, i % 2 === 0 ? 'left' : 'right');
    }
    // The last restart still counts: without it the piece would lock now.
    game.update(LOCK_DELAY_MS / 2);
    expect(activePiece(game).type).toBe('T');
    const x = activePiece(game).x;
    const lockedX = x === 2 ? 3 : 2;
    tap(game, x === 2 ? 'right' : 'left'); // one move too many
    game.update(1);
    expect(blockCount(game)).toBe(FLOOR_BLOCKS + 4);
    expect(filledCells(game.state.board)).toEqual(
      expect.arrayContaining(cellsAt('T', 0, lockedX, 2)),
    );
  });

  // Columns 1–5 are filled from row 5, columns 6–10 only from row 7 (right
  // column left open). The T rests on the ledge at y = 2 and falls to y = 4
  // when it is moved past the edge.
  const LEDGE = [
    'JJJJJ.....',
    'JJJJJ.....',
    ...Array<string>(14).fill('JJJJJJJJJ.'),
  ];
  const LEDGE_BLOCKS = 2 * 5 + 14 * 9;

  function tOnLedge(): Game {
    const game = newGame(['T', 'O'], boardFromRows(LEDGE));
    fall(game, 2);
    expect(activePiece(game).y).toBe(2);
    return game;
  }

  it('stops the delay when a move lifts the piece off the ground, then gravity applies', () => {
    const game = tOnLedge();
    game.update(LOCK_DELAY_MS - 1);
    tap(game, 'right');
    tap(game, 'right'); // box at x = 5: nothing below the T any more
    game.update(LOCK_DELAY_MS);
    expect(activePiece(game).type).toBe('T');
    expect(blockCount(game)).toBe(LEDGE_BLOCKS);
    advanceUntil(game, () => activePiece(game).y === 4, 2 * LEVEL_1_GRAVITY_MS);
    expect(blockCount(game)).toBe(LEDGE_BLOCKS);
  });

  it('resets the restart count when the piece reaches a lower row than ever before', () => {
    const game = tOnLedge();
    // Use up all restarts on the ledge (box alternating between x = 4 and 3,
    // ending at 4 because LOCK_RESETS_MAX is odd).
    for (let i = 0; i < LOCK_RESETS_MAX; i++) tap(game, i % 2 === 0 ? 'right' : 'left');
    expect(activePiece(game).x).toBe(4);
    tap(game, 'right'); // over the edge, the piece falls
    advanceUntil(game, () => activePiece(game).y === 4, 3 * LEVEL_1_GRAVITY_MS);
    game.update(LOCK_DELAY_MS / 2);
    tap(game, 'right'); // a restart again, not an immediate lock
    expect(activePiece(game).type).toBe('T');
    game.update(LOCK_DELAY_MS - 1);
    expect(blockCount(game)).toBe(LEDGE_BLOCKS);
    game.update(1);
    expect(blockCount(game)).toBe(LEDGE_BLOCKS + 4);
  });

  // On the flat floor a rotation of the T kicks it one row up and it still
  // rests (a restart). Rotating back leaves it floating one row above the
  // floor (another restart, the piece is lifted off), and gravity puts it down
  // on the same row again. A clockwise cycle moves the box one column left, a
  // counter-clockwise cycle one column right, so alternating keeps it in place.
  function rotationCycle(game: Game, first: 'rotateCW' | 'rotateCCW'): void {
    tap(game, first);
    tap(game, first === 'rotateCW' ? 'rotateCCW' : 'rotateCW');
    expect(activePiece(game).y).toBe(1);
    fall(game, 1);
    expect(activePiece(game).y).toBe(2);
  }

  // Each cycle uses two restarts, so this needs an odd LOCK_RESETS_MAX.
  function useAllButOneRestart(game: Game): void {
    expect(LOCK_RESETS_MAX % 2).toBe(1);
    for (let i = 0; i < (LOCK_RESETS_MAX - 1) / 2; i++) {
      rotationCycle(game, i % 2 === 0 ? 'rotateCW' : 'rotateCCW');
    }
    expect(blockCount(game)).toBe(FLOOR_BLOCKS);
  }

  it('counts a move that lifts the piece off the ground as a restart', () => {
    const game = landedT();
    useAllButOneRestart(game);
    tap(game, 'rotateCW'); // last restart, still resting
    expect(activePiece(game).rotation).toBe(1);
    tap(game, 'right'); // one move too many
    game.update(1);
    expect(blockCount(game)).toBe(FLOOR_BLOCKS + 4);
  });

  it('locks at once when the piece lands again with no restarts left', () => {
    const game = landedT();
    useAllButOneRestart(game);
    tap(game, 'rotateCW'); // last restart, still resting
    tap(game, 'rotateCCW'); // lifts the piece off
    expect(activePiece(game).y).toBe(1);
    expect(blockCount(game)).toBe(FLOOR_BLOCKS);
    fall(game, 1); // lands on a row it has reached before
    expect(blockCount(game)).toBe(FLOOR_BLOCKS + 4);
  });
});
