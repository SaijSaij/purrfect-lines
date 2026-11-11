import { describe, expect, it } from 'vitest';
import { createBoard, fullRows, isOccupied, removeRows } from './board';
import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import { at, boardFromRows, boardWith, filledCells } from './testing';

describe('A1 board', () => {
  it('has 10 columns and 20 rows', () => {
    expect(BOARD_WIDTH).toBe(10);
    expect(BOARD_HEIGHT).toBe(20);
    const board = createBoard();
    expect(board).toHaveLength(BOARD_HEIGHT);
    for (const row of board) {
      expect(row).toHaveLength(BOARD_WIDTH);
      expect(row.every((cell) => cell === null)).toBe(true);
    }
  });

  it('treats the walls and the floor as occupied', () => {
    const board = createBoard();
    expect(isOccupied(board, -1, 5)).toBe(true);
    expect(isOccupied(board, BOARD_WIDTH, 5)).toBe(true);
    expect(isOccupied(board, 5, BOARD_HEIGHT)).toBe(true);
    expect(isOccupied(board, -1, -1)).toBe(true);
    expect(isOccupied(board, BOARD_WIDTH, -1)).toBe(true);
  });

  it('treats the area above row 1 as free', () => {
    const board = createBoard();
    expect(isOccupied(board, 0, -1)).toBe(false);
    expect(isOccupied(board, 5, -3)).toBe(false);
    expect(isOccupied(board, BOARD_WIDTH - 1, -2)).toBe(false);
  });

  it('reports empty and filled cells inside the field', () => {
    const block = at(3, 7);
    const board = boardWith([block]);
    expect(isOccupied(board, block.x, block.y)).toBe(true);
    expect(isOccupied(board, block.x + 1, block.y)).toBe(false);
    expect(isOccupied(board, 0, 0)).toBe(false);
  });
});

describe('A15 clearing full rows', () => {
  it('removes one full row and moves everything above down by one', () => {
    const board = boardFromRows(['J.........', '..T.......', 'IIIIIIIIII']);
    const rows = fullRows(board);
    expect(rows).toHaveLength(1);
    expect(removeRows(board, rows)).toEqual(boardFromRows(['J.........', '..T.......']));
  });

  it('removes two full rows', () => {
    const board = boardFromRows(['.....S....', 'IIIIIIIIII', 'OOOOOOOOOO']);
    const rows = fullRows(board);
    expect(rows).toHaveLength(2);
    expect(removeRows(board, rows)).toEqual(boardFromRows(['.....S....']));
  });

  it('removes three full rows', () => {
    const board = boardFromRows(['Z.Z.......', 'IIIIIIIIII', 'OOOOOOOOOO', 'LLLLLLLLLL']);
    const rows = fullRows(board);
    expect(rows).toHaveLength(3);
    expect(removeRows(board, rows)).toEqual(boardFromRows(['Z.Z.......']));
  });

  it('removes four full rows', () => {
    const board = boardFromRows([
      '.........T',
      'IIIIIIIIII',
      'OOOOOOOOOO',
      'LLLLLLLLLL',
      'JJJJJJJJJJ',
    ]);
    const rows = fullRows(board);
    expect(rows).toHaveLength(4);
    expect(removeRows(board, rows)).toEqual(boardFromRows(['.........T']));
  });

  it('removes rows 17 and 19 while row 18 is not full', () => {
    const board = boardFromRows([
      'S.........', // row 16
      'IIIIIIIIII', // row 17, full
      'T.T.T.T.T.', // row 18
      'OOOOOOOOOO', // row 19, full
      'LL.LL.LL.L', // row 20
    ]);
    const rows = fullRows(board);
    // Rows 17 and 19 are the 0-based rows 16 and 18.
    expect(rows).toEqual([16, 18]);
    expect(removeRows(board, rows)).toEqual(
      boardFromRows([
        'S.........', // was row 16, moved down by two
        'T.T.T.T.T.', // was row 18, moved down by one
        'LL.LL.LL.L', // row 20 stays
      ]),
    );
  });

  it('does not let single blocks fall into gaps', () => {
    const board = boardFromRows(['J.........', '..........', 'IIIIIIIIII', '.OOOOOOOOO']);
    expect(filledCells(removeRows(board, fullRows(board)))).toEqual(
      filledCells(boardFromRows(['J.........', '..........', '.OOOOOOOOO'])),
    );
  });

  it('leaves a board without full rows unchanged', () => {
    const board = boardFromRows(['IIIIIIIII.']);
    const rows = fullRows(board);
    expect(rows).toEqual([]);
    expect(removeRows(board, rows)).toEqual(board);
  });
});
