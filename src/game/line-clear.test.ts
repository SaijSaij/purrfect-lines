import { describe, expect, it } from 'vitest';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  HARD_DROP_POINTS,
  LINE_CLEAR_MS,
  LINE_POINTS,
  REPEAT_DELAY_MS,
  REPEAT_INTERVAL_MS,
} from './constants';
import { createGame, type Game } from './game';
import { activeCells, at, boardFromRows, filledCells, fixedSequence, sortPoints, tap } from './testing';

const ONE_ROW_POINTS = LINE_POINTS[0] ?? Number.NaN;
const BOTTOM_ROW = BOARD_HEIGHT - 1;

// The O spawns in columns 5–6, rows 1–2 (A4).
const O_SPAWN = sortPoints([at(5, 1), at(6, 1), at(5, 2), at(6, 2)]);

/**
 * The bottom row is full except for columns 4–7, so the first piece (a
 * horizontal bar spawning in exactly these columns) completes it with a hard
 * drop. The second piece is a square.
 */
function gameBeforeClear(): Game {
  return createGame({ sequence: fixedSequence(['I', 'O']), board: boardFromRows(['JJJ....JJJ']) });
}

/** Completes the bottom row and starts the animation. */
function startClear(): Game {
  const game = gameBeforeClear();
  tap(game, 'hardDrop');
  return game;
}

function bottomRowIsFull(game: Game): boolean {
  const row = game.state.board[BOTTOM_ROW] ?? [];
  return row.length === BOARD_WIDTH && row.every((cell) => cell !== null);
}

describe('A16 line clear animation', () => {
  it('counts score and lines as soon as the piece locks', () => {
    const game = startClear();
    expect(game.state.lines).toBe(1);
    // The bar skips rows 2–20 (BOARD_HEIGHT - 1 rows) on its way down.
    expect(game.state.score).toBe(ONE_ROW_POINTS + (BOARD_HEIGHT - 1) * HARD_DROP_POINTS);
  });

  it('lights up the full rows and keeps them on the board for LINE_CLEAR_MS', () => {
    const game = startClear();
    expect(game.state.clearingRows).toEqual([BOTTOM_ROW]);
    expect(bottomRowIsFull(game)).toBe(true);
    expect(game.state.active).toBeNull();

    game.update(LINE_CLEAR_MS - 1);
    expect(game.state.clearingRows).toEqual([BOTTOM_ROW]);
    expect(bottomRowIsFull(game)).toBe(true);
    expect(game.state.active).toBeNull();
  });

  it('removes the rows and shows the next piece after LINE_CLEAR_MS', () => {
    const game = startClear();
    game.update(LINE_CLEAR_MS);
    expect(game.state.clearingRows).toEqual([]);
    expect(filledCells(game.state.board)).toEqual([]);
    expect(activeCells(game)).toEqual(O_SPAWN);
  });

  it('lists every full row, top to bottom', () => {
    const game = createGame({
      sequence: fixedSequence(['I', 'O']),
      board: boardFromRows(['JJJJ.JJJJJ', 'J.........', 'JJJJ.JJJJJ']),
    });
    // Turned counter-clockwise, the bar stands in column 5 (A8). It fills
    // rows 17–20 there and completes rows 18 and 20, but not row 19.
    tap(game, 'rotateCCW');
    tap(game, 'hardDrop');
    expect(game.state.clearingRows).toEqual([BOARD_HEIGHT - 3, BOTTOM_ROW]);
  });

  it('ignores game keys while the rows light up', () => {
    const game = startClear();
    const score = game.state.score;
    for (const action of ['left', 'right', 'rotateCW', 'rotateCCW', 'softDrop', 'hardDrop'] as const) {
      tap(game, action);
    }
    game.update(LINE_CLEAR_MS);
    expect(activeCells(game)).toEqual(O_SPAWN);
    expect(game.state.score).toBe(score);
  });

  it('does not move the next piece with a move key pressed during the animation', () => {
    const game = startClear();
    game.press('left');
    game.update(LINE_CLEAR_MS);
    // Long enough for the first key repeat, too short for a fall step.
    game.update(REPEAT_DELAY_MS + REPEAT_INTERVAL_MS);
    expect(activeCells(game)).toEqual(O_SPAWN);
  });

  it('shows the next piece at once when no row is full', () => {
    const game = createGame({ sequence: fixedSequence(['I', 'O']) });
    tap(game, 'hardDrop');
    expect(game.state.clearingRows).toEqual([]);
    expect(activeCells(game)).toEqual(O_SPAWN);
  });
});
