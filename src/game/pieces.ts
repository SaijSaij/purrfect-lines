// The seven pieces and their rotation states (A2).

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'L' | 'J';

export const PIECE_TYPES: readonly PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];

/** Rotation state: 0 = spawn, 1 = R (clockwise), 2 = twice, 3 = L (counter-clockwise). */
export type Rotation = 0 | 1 | 2 | 3;

export interface CellOffset {
  readonly x: number;
  readonly y: number;
}

interface Shape {
  /** Width and height of the square rotation box. */
  readonly size: number;
  /** Rows of the spawn state, 'X' = block. */
  readonly spawn: readonly string[];
}

const SHAPES: Record<PieceType, Shape> = {
  I: { size: 4, spawn: ['....', 'XXXX', '....', '....'] },
  O: { size: 2, spawn: ['XX', 'XX'] },
  T: { size: 3, spawn: ['.X.', 'XXX', '...'] },
  S: { size: 3, spawn: ['.XX', 'XX.', '...'] },
  Z: { size: 3, spawn: ['XX.', '.XX', '...'] },
  L: { size: 3, spawn: ['..X', 'XXX', '...'] },
  J: { size: 3, spawn: ['X..', 'XXX', '...'] },
};

function parse(rows: readonly string[]): CellOffset[] {
  return rows.flatMap((row, y) =>
    [...row].flatMap((ch, x) => (ch === 'X' ? [{ x, y }] : [])),
  );
}

/** Turns cells a quarter turn clockwise around the centre of the box. */
function rotateClockwise(cells: readonly CellOffset[], size: number): CellOffset[] {
  return cells.map(({ x, y }) => ({ x: size - 1 - y, y: x }));
}

function buildStates(shape: Shape): readonly (readonly CellOffset[])[] {
  const states = [parse(shape.spawn)];
  for (let i = 1; i < 4; i++) {
    const previous = states[i - 1] ?? [];
    states.push(rotateClockwise(previous, shape.size));
  }
  return states;
}

const STATES = Object.fromEntries(
  PIECE_TYPES.map((type) => [type, buildStates(SHAPES[type])]),
) as Record<PieceType, readonly (readonly CellOffset[])[]>;

/** Block positions of a piece relative to the top-left corner of its rotation box. */
export function pieceCells(type: PieceType, rotation: Rotation): readonly CellOffset[] {
  return STATES[type][rotation] ?? [];
}

/** Width of the square rotation box of a piece. */
export function boxSize(type: PieceType): number {
  return SHAPES[type].size;
}
