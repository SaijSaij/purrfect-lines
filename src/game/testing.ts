// Test helpers for the game logic. Only imported by unit tests.
import type { Board, Cell } from './board';
import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import type { Action, Game, PieceSource } from './game';
import { pieceCells, PIECE_TYPES, type PieceType } from './pieces';

export interface Point {
  x: number;
  y: number;
}

/**
 * Converts spec coordinates (columns 1–10 from the left, rows 1–20 from the
 * top) into 0-based board coordinates. Rows above the field are negative.
 */
export function at(column: number, row: number): Point {
  return { x: column - 1, y: row - 1 };
}

export function sortPoints(points: readonly Point[]): Point[] {
  return [...points].sort((a, b) => a.y - b.y || a.x - b.x);
}

export function translate(points: readonly Point[], dx: number, dy: number): Point[] {
  return sortPoints(points.map((p) => ({ x: p.x + dx, y: p.y + dy })));
}

/** Parses a rotation box drawn as text ('X' = block) into relative cells. */
export function cellsFromGrid(grid: readonly string[]): Point[] {
  const points: Point[] = [];
  grid.forEach((line, y) => {
    [...line].forEach((ch, x) => {
      if (ch === 'X') points.push({ x, y });
    });
  });
  return sortPoints(points);
}

function toCell(ch: string): Cell {
  if (ch === '.') return null;
  const type = PIECE_TYPES.find((t) => t === ch);
  if (type === undefined) throw new Error(`Unknown cell character "${ch}"`);
  return type;
}

/**
 * Builds a board from text rows aligned to the bottom of the field.
 * '.' is empty, a piece letter (I, O, T, S, Z, L, J) is a filled cell.
 */
export function boardFromRows(rows: readonly string[]): Board {
  if (rows.length > BOARD_HEIGHT) throw new Error('Too many rows');
  const empty = '.'.repeat(BOARD_WIDTH);
  const padded = [...Array<string>(BOARD_HEIGHT - rows.length).fill(empty), ...rows];
  return padded.map((row) => {
    if (row.length !== BOARD_WIDTH) throw new Error(`Row needs ${BOARD_WIDTH} cells: "${row}"`);
    return [...row].map(toCell);
  });
}

/** Builds an otherwise empty board with the given cells filled. */
export function boardWith(points: readonly Point[], type: PieceType = 'J'): Board {
  return Array.from({ length: BOARD_HEIGHT }, (_, y) =>
    Array.from({ length: BOARD_WIDTH }, (_, x): Cell =>
      points.some((p) => p.x === x && p.y === y) ? type : null,
    ),
  );
}

/** All filled cells of a board, sorted from top to bottom. */
export function filledCells(board: Board): Point[] {
  const points: Point[] = [];
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell !== null) points.push({ x, y });
    });
  });
  return sortPoints(points);
}

/** A piece source that repeats the given pieces in order. */
export function fixedSequence(types: readonly PieceType[]): PieceSource {
  let index = 0;
  const pick = (i: number): PieceType => {
    const type = types[i % types.length];
    if (type === undefined) throw new Error('Empty sequence');
    return type;
  };
  return {
    next: () => pick(index++),
    peek: () => pick(index),
  };
}

/** Presses and releases a key, like a short key tap. */
export function tap(game: Game, action: Action): void {
  game.press(action);
  game.release(action);
}

/** Absolute board cells of the falling piece, or [] if there is none. */
export function activeCells(game: Game): Point[] {
  const piece = game.state.active;
  if (piece === null) return [];
  return translate(pieceCells(piece.type, piece.rotation), piece.x, piece.y);
}

/** Advances time in small steps until the condition holds (or fails after maxMs). */
export function advanceUntil(game: Game, condition: () => boolean, maxMs = 30_000): void {
  const stepMs = 16;
  for (let elapsed = 0; elapsed <= maxMs; elapsed += stepMs) {
    if (condition()) return;
    game.update(stepMs);
  }
  throw new Error(`Condition not reached within ${maxMs} ms`);
}
