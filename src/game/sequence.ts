// Piece sequence in bags of seven (A3).
import { PIECE_TYPES, type PieceType } from './pieces';
import { createRandom } from './random';

export interface PieceSequence {
  /** Takes the next piece. */
  next(): PieceType;
  /** Shows the next piece without taking it. */
  peek(): PieceType;
  /** The pieces left in the current bag, next first; for the debug display (A42). */
  upcoming?(): readonly PieceType[];
}

function shuffledBag(random: () => number): PieceType[] {
  const bag = [...PIECE_TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = bag[i];
    const b = bag[j];
    if (a !== undefined && b !== undefined) {
      bag[i] = b;
      bag[j] = a;
    }
  }
  return bag;
}

export function createPieceSequence(seed: number): PieceSequence {
  const random = createRandom(seed);
  const queue: PieceType[] = [];
  const peek = (): PieceType => {
    if (queue.length === 0) queue.push(...shuffledBag(random));
    const piece = queue[0];
    if (piece === undefined) throw new Error('Empty bag');
    return piece;
  };
  return {
    peek,
    upcoming: () => {
      peek(); // refills an empty bag
      return [...queue];
    },
    next: () => {
      const piece = peek();
      queue.shift();
      return piece;
    },
  };
}
