// Helpers for browser tests. They read the read-only test interface
// window.__purrfectLines (A43) instead of comparing pixels.
import { expect, type Page } from '@playwright/test';

export interface CellPosition {
  x: number;
  y: number;
}

/** Shape of window.__purrfectLines. Coordinates are 0-based, y = 0 is row 1. */
export interface PurrfectLinesState {
  screen: string;
  board: (string | null)[][];
  active: { type: string; cells: CellPosition[] } | null;
  next: string;
  score: number;
  lines: number;
  level: number;
}

async function readStateOrNull(page: Page): Promise<PurrfectLinesState | null> {
  const state = await page.evaluate(
    () => (window as unknown as { __purrfectLines?: unknown }).__purrfectLines ?? null,
  );
  return state as PurrfectLinesState | null;
}

export async function readState(page: Page): Promise<PurrfectLinesState> {
  const state = await readStateOrNull(page);
  if (state === null) throw new Error('window.__purrfectLines is missing');
  return state;
}

/**
 * Opens the game and waits until a piece is falling. Presses Enter first if
 * a start screen is shown, so the helper works before and after it exists.
 */
export async function startGame(page: Page, url: string): Promise<PurrfectLinesState> {
  await page.goto(url);
  await expect
    .poll(() => readStateOrNull(page).then((s) => s !== null), {
      message: 'window.__purrfectLines should exist',
    })
    .toBe(true);
  if ((await readState(page)).screen === 'start') await page.keyboard.press('Enter');
  await expect
    .poll(() => readState(page).then((s) => s.screen === 'playing' && s.active !== null))
    .toBe(true);
  return readState(page);
}

export async function waitForScreen(page: Page, screen: string): Promise<void> {
  await expect.poll(() => readState(page).then((s) => s.screen)).toBe(screen);
}

/** Hard drops until the game ends; with ?seed=1 the stack reaches the top with points (A5). */
export async function playUntilGameOver(page: Page): Promise<void> {
  for (let i = 0; i < 60; i++) {
    if ((await readState(page)).screen === 'gameOver') break;
    await page.keyboard.press('Space');
  }
  await waitForScreen(page, 'gameOver');
}

export function leftmostColumn(state: PurrfectLinesState): number {
  if (state.active === null) throw new Error('No falling piece');
  return Math.min(...state.active.cells.map((c) => c.x));
}
