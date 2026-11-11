// Wall kicks (A9): offsets tried in order when a rotated piece does not fit.
// The tables are written as in the spec, with y counting upwards; on the board
// y grows downwards, so kickOffsets flips the sign.
import type { CellOffset, PieceType, Rotation } from './pieces';

type Table = Readonly<Record<string, readonly (readonly [number, number])[]>>;

// Keys are "from>to" with the rotation states 0, 1 (R), 2 and 3 (L).
const JLSTZ: Table = {
  '0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3>2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3>0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

const BAR: Table = {
  '0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1>0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2>1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3>2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0>3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

const NO_KICK: readonly CellOffset[] = [{ x: 0, y: 0 }];

/** Board offsets to try, in order, when rotating a piece from one state to the next. */
export function kickOffsets(type: PieceType, from: Rotation, to: Rotation): readonly CellOffset[] {
  if (type === 'O') return NO_KICK; // the square needs no table
  const table = type === 'I' ? BAR : JLSTZ;
  const tests = table[`${from}>${to}`];
  if (tests === undefined) return NO_KICK;
  return tests.map(([x, y]) => ({ x, y: -y }));
}
