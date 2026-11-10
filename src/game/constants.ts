// Tunable game constants. Tests refer to these names, never to the numbers.

/** Number of columns of the playing field (A1). */
export const BOARD_WIDTH = 10;

/** Number of visible rows of the playing field (A1). */
export const BOARD_HEIGHT = 20;

/** Fall interval in milliseconds for level 1, 2, 3, ... (A10). */
export const GRAVITY_MS: readonly number[] = [
  1000, 850, 720, 610, 520, 440, 370, 310, 260, 215, 175, 140, 110, 80, 50,
];

/** Soft drop falls this many times faster than gravity (A11). */
export const SOFT_DROP_FACTOR = 20;
