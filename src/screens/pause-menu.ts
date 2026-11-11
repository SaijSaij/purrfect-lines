// Entries of the pause menu (A23) and moving the selection. No DOM.

export const PAUSE_MENU = ['resume', 'giveUp'] as const;

export type PauseMenuEntry = (typeof PAUSE_MENU)[number];

/** Moves the selection up (-1) or down (+1); it stops at the first and last entry. */
export function moveSelection(index: number, delta: -1 | 1): number {
  return Math.min(PAUSE_MENU.length - 1, Math.max(0, index + delta));
}

export function entryAt(index: number): PauseMenuEntry {
  return PAUSE_MENU[index] ?? 'resume';
}
