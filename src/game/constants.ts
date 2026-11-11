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

/** A resting piece locks after this many milliseconds (A13). */
export const LOCK_DELAY_MS = 500;

/** How often moves and rotations may restart the lock delay per piece (A13). */
export const LOCK_RESETS_MAX = 15;

/** A held move key repeats for the first time after this delay (A7). */
export const REPEAT_DELAY_MS = 170;

/** After the first repeat, a held move key repeats at this interval (A7). */
export const REPEAT_INTERVAL_MS = 50;
