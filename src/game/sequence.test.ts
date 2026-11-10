import { describe, expect, it } from 'vitest';
import { PIECE_TYPES, type PieceType } from './pieces';
import { createPieceSequence } from './sequence';

function take(seed: number, count: number): PieceType[] {
  const sequence = createPieceSequence(seed);
  return Array.from({ length: count }, () => sequence.next());
}

describe('A3 piece sequence (bag of seven)', () => {
  it('contains every piece exactly once in each group of seven (100 seeds, 70 pieces)', () => {
    const allPieces = [...PIECE_TYPES].sort();
    for (let seed = 1; seed <= 100; seed++) {
      const pieces = take(seed, 70);
      for (let group = 0; group < 10; group++) {
        const bag = pieces.slice(group * 7, group * 7 + 7).sort();
        expect(bag, `seed ${seed}, group ${group + 1}`).toEqual(allPieces);
      }
    }
  });

  it('gives the same sequence for the same seed', () => {
    expect(take(42, 50)).toEqual(take(42, 50));
    expect(take(1, 50)).toEqual(take(1, 50));
  });

  it('usually gives different sequences for different seeds', () => {
    const sequences = new Set<string>();
    for (let seed = 1; seed <= 100; seed++) {
      sequences.add(take(seed, 14).join(''));
    }
    expect(sequences.size).toBeGreaterThanOrEqual(90);
  });

  it('peek shows the upcoming piece without taking it', () => {
    const sequence = createPieceSequence(7);
    const expected = take(7, 10);
    for (const piece of expected) {
      expect(sequence.peek()).toBe(piece);
      expect(sequence.peek()).toBe(piece);
      expect(sequence.next()).toBe(piece);
    }
  });
});
