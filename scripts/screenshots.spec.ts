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
 * Where the first four pieces go, each moved from its spawn position and then
 * hard-dropped: O to columns 9–10, L to 3–5, J to 6–8. That leaves only
 * columns 1–2 of the bottom row empty, and the S fills them.
 */
const PLACEMENTS = [
  { type: 'O', key: 'ArrowRight', times: 4 },
  { type: 'L', key: 'ArrowLeft', times: 1 },
  { type: 'J', key: 'ArrowRight', times: 2 },
  { type: 'S', key: 'ArrowLeft', times: 3 },
] as const;

type Placement = (typeof PLACEMENTS)[number];

async function place(page: Page, { key, times }: Placement): Promise<void> {
  await move(page, key, times);
  await page.keyboard.press('Space');
}

/** Drops O, L and J; the S is falling afterwards. */
async function buildAlmostFullRow(page: Page): Promise<void> {
  for (const placement of PLACEMENTS.slice(0, 3)) {
    await waitForPiece(page, placement.type);
    await place(page, placement);
  }
  await waitForPiece(page, PLACEMENTS[3].type);
}

/** The S completes the bottom row. */
async function completeRow(page: Page): Promise<void> {
  await place(page, PLACEMENTS[3]);
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
  // Slow, so gravity cannot move a piece between two drops and change the score.
  await startGame(page, '/?seed=1&slow=10');
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
 * About 6 s of play at normal speed with the same PLACEMENTS, so the bottom
 * row fills up and lights up. Each file name carries the time of the frame in
 * milliseconds since the first one, so playback keeps the real pace.
 */
test('animated gameplay frames', async ({ page }) => {
  await startGame(page, '/?seed=1');
  const moves = PLACEMENTS.flatMap((p) => [
    () => move(page, p.key, p.times),
    () => page.keyboard.press('Space'),
  ]);
  const start = Date.now();
  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    const name = `${String(frame).padStart(3, '0')}-${Date.now() - start}`;
    await page.locator('#game').screenshot({ path: `${FRAMES}/${name}.png` });
    // Every fifth frame the next move happens; in between the piece falls.
    if (frame % 5 === 4) await moves[(frame - 4) / 5]?.();
    await page.waitForTimeout(FRAME_MS);
  }
  // Without the cleared row the animation would not show what the README says.
  expect((await readState(page)).lines).toBe(1);
});
