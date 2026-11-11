// The playing field (A1) and clearing full rows (A15).
// Coordinates are 0-based: x = column from the left, y = row from the top.
// Rows above the field (y < 0) belong to it logically but are never stored.
import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import type { CellOffset, PieceType } from './pieces';

export type Cell = PieceType | null;

/** Rows from top to bottom, each with BOARD_WIDTH cells. */
export type Board = readonly (readonly Cell[])[];

function emptyRow(): Cell[] {
  return Array<Cell>(BOARD_WIDTH).fill(null);
}

export function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, emptyRow);
}

/** Walls and floor count as occupied, the area above the field as free. */
export function isOccupied(board: Board, x: number, y: number): boolean {
  if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return true;
  if (y < 0) return false;
  return (board[y]?.[x] ?? null) !== null;
}

/** Writes cells into a copy of the board. Cells above the field are dropped. */
export function placeCells(board: Board, cells: readonly CellOffset[], type: PieceType): Board {
  const rows = board.map((row) => [...row]);
  for (const { x, y } of cells) {
    const row = rows[y];
    if (row !== undefined) row[x] = type;
  }
  return rows;
}

export interface ClearResult {
  readonly board: Board;
  readonly cleared: number;
}

/** Indices of all full rows, from top to bottom. */
export function fullRows(board: Board): number[] {
  return board.flatMap((row, y) => (row.every((cell) => cell !== null) ? [y] : []));
}

/** Removes the given rows; everything above moves down by the number of rows removed below it. */
export function removeRows(board: Board, rows: readonly number[]): Board {
  const remaining = board.filter((_, y) => !rows.includes(y));
  const newRows = Array.from({ length: board.length - remaining.length }, emptyRow);
  return [...newRows, ...remaining];
}

/** Removes all full rows; everything above moves down by the number of rows removed below it. */
export function clearFullRows(board: Board): ClearResult {
  const rows = fullRows(board);
  return { board: removeRows(board, rows), cleared: rows.length };
}
