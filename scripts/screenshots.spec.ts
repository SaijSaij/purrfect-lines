// Renders fixed scenes of the game into docs/images/ (`npm run screenshots`).
// Repeatable: every scene uses ?seed=1, and where a piece is falling ?slow=10,
// so it falls only one row every 10 s while the picture is taken.
// The piece order for seed 1 starts with O, L, J, S, T, I, Z.
import { expect, test, type Page } from '@playwright/test';
import { readState, startGame } from '../e2e/support/game';

const IMAGES = 'docs/images';
/** Frames for the animated picture; scripts/make-apng.js joins them. */
const FRAMES = 'test-results/screenshots/apng-frames';

async function waitForScreen(page: Page, screen: string): Promise<void> {
  await expect.poll(() => readState(page).then((s) => s.screen)).toBe(screen);
}

async function waitForPiece(page: Page, type: string): Promise<void> {
  await expect.poll(() => readState(page).then((s) => s.active?.type)).toBe(type);
}

async function shoot(page: Page, name: string): Promise<void> {
  await page.locator('#game').screenshot({ path: `${IMAGES}/${name}.png`, animations: 'disabled' });
}

async function move(page: Page, key: 'ArrowLeft' | 'ArrowRight', times: number): Promise<void> {
  for (let i = 0; i < times; i++) await page.keyboard.press(key);
}

/**
 * Drops O, L and J so that only columns 1–2 of the bottom row stay empty:
 * L in columns 3–5, J in 6–8, O in 9–10. The S comes next.
 */
async function buildAlmostFullRow(page: Page): Promise<void> {
  await waitForPiece(page, 'O');
  await move(page, 'ArrowRight', 4);
  await page.keyboard.press('Space');
  await waitForPiece(page, 'L');
  await move(page, 'ArrowLeft', 1);
  await page.keyboard.press('Space');
  await waitForPiece(page, 'J');
  await move(page, 'ArrowRight', 2);
  await page.keyboard.press('Space');
  await waitForPiece(page, 'S');
}

/** The S in columns 1–3 completes the bottom row. */
async function completeRow(page: Page): Promise<void> {
  await move(page, 'ArrowLeft', 3);
  await page.keyboard.press('Space');
}

test('start screen', async ({ page }) => {
  await page.goto('/?seed=1');
  await waitForScreen(page, 'start');
  await shoot(page, 'start-screen');
});

test('gameplay', async ({ page }) => {
  await startGame(page, '/?seed=1&slow=10');
  await buildAlmostFullRow(page);
  await shoot(page, 'gameplay');
});

test('line clear', async ({ page }) => {
  await startGame(page, '/?seed=1&slow=10');
  await buildAlmostFullRow(page);
  await completeRow(page);
  // With ?slow=10 the rows light up for 3 s.
  await expect.poll(() => readState(page).then((s) => s.lines)).toBe(1);
  await shoot(page, 'line-clear');
});

test('pause', async ({ page }) => {
  await startGame(page, '/?seed=1&slow=10');
  await buildAlmostFullRow(page);
  await page.keyboard.press('p');
  await waitForScreen(page, 'paused');
  await shoot(page, 'pause');
});

test('game over', async ({ page }) => {
  await startGame(page, '/?seed=1');
  for (let i = 0; i < 60; i++) {
    if ((await readState(page)).screen === 'gameOver') break;
    await page.keyboard.press('Space');
  }
  await waitForScreen(page, 'gameOver');
  await shoot(page, 'game-over');
});

/** Pause between two frames of the animated picture. */
const FRAME_MS = 100;
const FRAME_COUNT = 50;

/**
 * About 6 s of play at normal speed: the same moves as above, so the bottom
 * row fills up and lights up. Each file name carries the time of the frame in
 * milliseconds since the first one, so playback keeps the real pace.
 */
test('animated gameplay frames', async ({ page }) => {
  await startGame(page, '/?seed=1');
  const moves: (() => Promise<void>)[] = [
    () => move(page, 'ArrowRight', 4),
    () => page.keyboard.press('Space'),
    () => move(page, 'ArrowLeft', 1),
    () => page.keyboard.press('Space'),
    () => move(page, 'ArrowRight', 2),
    () => page.keyboard.press('Space'),
    () => move(page, 'ArrowLeft', 3),
    () => page.keyboard.press('Space'),
  ];
  const start = Date.now();
  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    const name = `${String(frame).padStart(3, '0')}-${Date.now() - start}`;
    await page.locator('#game').screenshot({ path: `${FRAMES}/${name}.png` });
    // Every fifth frame the next move happens; in between the piece falls.
    if (frame % 5 === 4) await moves[(frame - 4) / 5]?.();
    await page.waitForTimeout(FRAME_MS);
  }
});
