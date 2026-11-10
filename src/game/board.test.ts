import { describe, expect, it } from 'vitest';
import { clearFullRows, createBoard, isOccupied } from './board';
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
    const result = clearFullRows(board);
    expect(result.cleared).toBe(1);
    expect(result.board).toEqual(boardFromRows(['J.........', '..T.......']));
  });

  it('removes two full rows', () => {
    const board = boardFromRows(['.....S....', 'IIIIIIIIII', 'OOOOOOOOOO']);
    const result = clearFullRows(board);
    expect(result.cleared).toBe(2);
    expect(result.board).toEqual(boardFromRows(['.....S....']));
  });

  it('removes three full rows', () => {
    const board = boardFromRows(['Z.Z.......', 'IIIIIIIIII', 'OOOOOOOOOO', 'LLLLLLLLLL']);
    const result = clearFullRows(board);
    expect(result.cleared).toBe(3);
    expect(result.board).toEqual(boardFromRows(['Z.Z.......']));
  });

  it('removes four full rows', () => {
    const board = boardFromRows([
      '.........T',
      'IIIIIIIIII',
      'OOOOOOOOOO',
      'LLLLLLLLLL',
      'JJJJJJJJJJ',
    ]);
    const result = clearFullRows(board);
    expect(result.cleared).toBe(4);
    expect(result.board).toEqual(boardFromRows(['.........T']));
  });

  it('removes rows 17 and 19 while row 18 is not full', () => {
    const board = boardFromRows([
      'S.........', // row 16
      'IIIIIIIIII', // row 17, full
      'T.T.T.T.T.', // row 18
      'OOOOOOOOOO', // row 19, full
      'LL.LL.LL.L', // row 20
    ]);
    const result = clearFullRows(board);
    expect(result.cleared).toBe(2);
    expect(result.board).toEqual(
      boardFromRows([
        'S.........', // was row 16, moved down by two
        'T.T.T.T.T.', // was row 18, moved down by one
        'LL.LL.LL.L', // row 20 stays
      ]),
    );
  });

  it('does not let single blocks fall into gaps', () => {
    const board = boardFromRows(['J.........', '..........', 'IIIIIIIIII', '.OOOOOOOOO']);
    const result = clearFullRows(board);
    expect(filledCells(result.board)).toEqual(
      filledCells(boardFromRows(['J.........', '..........', '.OOOOOOOOO'])),
    );
  });

  it('leaves a board without full rows unchanged', () => {
    const board = boardFromRows(['IIIIIIIII.']);
    const result = clearFullRows(board);
    expect(result.cleared).toBe(0);
    expect(result.board).toEqual(board);
  });
});
