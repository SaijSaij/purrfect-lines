// Small seeded random number generator (mulberry32), so a seed always gives
// the same piece sequence (A3, A39).

/** Returns a function that yields numbers in [0, 1) determined by the seed. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random seed for games without a fixed seed. */
export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}
