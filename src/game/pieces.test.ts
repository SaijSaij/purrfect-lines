import { describe, expect, it } from 'vitest';
import { pieceCells, PIECE_TYPES, type PieceType, type Rotation } from './pieces';
import { cellsFromGrid, sortPoints } from './testing';

// Rotation states inside the rotation box: 0 (spawn), R (once clockwise),
// 2 (twice), L (once counter-clockwise). 'X' marks a block.
const STATES: Record<PieceType, readonly (readonly string[])[]> = {
  I: [
    ['....', 'XXXX', '....', '....'],
    ['..X.', '..X.', '..X.', '..X.'],
    ['....', '....', 'XXXX', '....'],
    ['.X..', '.X..', '.X..', '.X..'],
  ],
  O: [
    ['XX', 'XX'],
    ['XX', 'XX'],
    ['XX', 'XX'],
    ['XX', 'XX'],
  ],
  T: [
    ['.X.', 'XXX', '...'],
    ['.X.', '.XX', '.X.'],
    ['...', 'XXX', '.X.'],
    ['.X.', 'XX.', '.X.'],
  ],
  S: [
    ['.XX', 'XX.', '...'],
    ['.X.', '.XX', '..X'],
    ['...', '.XX', 'XX.'],
    ['X..', 'XX.', '.X.'],
  ],
  Z: [
    ['XX.', '.XX', '...'],
    ['..X', '.XX', '.X.'],
    ['...', 'XX.', '.XX'],
    ['.X.', 'XX.', 'X..'],
  ],
  L: [
    ['..X', 'XXX', '...'],
    ['.X.', '.X.', '.XX'],
    ['...', 'XXX', 'X..'],
    ['XX.', '.X.', '.X.'],
  ],
  J: [
    ['X..', 'XXX', '...'],
    ['.XX', '.X.', '.X.'],
    ['...', 'XXX', '..X'],
    ['.X.', '.X.', 'XX.'],
  ],
};

const ROTATIONS: readonly Rotation[] = [0, 1, 2, 3];
const ROTATION_NAMES = ['0', 'R', '2', 'L'];

describe('A2 pieces', () => {
  it('has the seven pieces I, O, T, S, Z, L, J', () => {
    expect([...PIECE_TYPES].sort()).toEqual(['I', 'J', 'L', 'O', 'S', 'T', 'Z']);
  });

  for (const type of Object.keys(STATES) as PieceType[]) {
    for (const rotation of ROTATIONS) {
      it(`${type} in state ${ROTATION_NAMES[rotation]} matches the table`, () => {
        const grid = STATES[type][rotation];
        if (grid === undefined) throw new Error('Missing table entry');
        expect(sortPoints(pieceCells(type, rotation))).toEqual(cellsFromGrid(grid));
      });
    }
  }

  it('every piece has exactly four blocks in every state', () => {
    for (const type of PIECE_TYPES) {
      for (const rotation of ROTATIONS) {
        expect(pieceCells(type, rotation)).toHaveLength(4);
      }
    }
  });
});
