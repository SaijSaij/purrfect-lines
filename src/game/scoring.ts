// Fall speed, points and levels (A10, A17, A18) as pure functions.
import { GRAVITY_MS, LINE_POINTS, LINES_PER_LEVEL } from './constants';

/** Level after clearing `lines` rows in total, starting from `startLevel` (A18, A40). */
export function levelFor(lines: number, startLevel: number): number {
  return startLevel + Math.floor(lines / LINES_PER_LEVEL);
}

/** Points for clearing `cleared` rows at once on `level`, the level before the clear (A17). */
export function linePoints(cleared: number, level: number): number {
  return (LINE_POINTS[cleared - 1] ?? 0) * level;
}

/** Fall interval of a level; beyond the end of the table the last value applies (A10). */
export function gravityMs(level: number): number {
  const index = Math.min(Math.max(level, 1), GRAVITY_MS.length) - 1;
  return GRAVITY_MS[index] ?? Number.NaN;
}
