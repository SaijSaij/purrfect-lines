// Screens and flow (M4): start, pause, giving up, game over, window size.
// Screens are HTML elements over the canvas, identified by their ids.
import { expect, test, type Page } from '@playwright/test';
import { readState, startGame, type CellPosition, type PurrfectLinesState } from './support/game';

const START_SCREEN = '#start-screen';
const PAUSE_SCREEN = '#pause-screen';
const GAME_OVER_SCREEN = '#game-over-screen';

function lowestRow(state: PurrfectLinesState): number {
  const cells = state.active?.cells ?? [];
  return Math.max(...cells.map((c) => c.y));
}

function activeCells(state: PurrfectLinesState): CellPosition[] {
  return state.active?.cells ?? [];
}

async function waitForScreen(page: Page, screen: string): Promise<void> {
  await expect.poll(() => readState(page).then((s) => s.screen)).toBe(screen);
}

/** Hard drops until the game ends; with ?seed=1 the stack reaches the top (A5). */
async function playUntilGameOver(page: Page): Promise<void> {
  for (let i = 0; i < 60; i++) {
    if ((await readState(page)).screen === 'gameOver') break;
    await page.keyboard.press('Space');
  }
  await waitForScreen(page, 'gameOver');
}

/** Whether the element's box covers the whole canvas. */
async function coversCanvas(page: Page, selector: string): Promise<boolean> {
  const cover = await page.locator(selector).boundingBox();
  const canvas = await page.locator('canvas').boundingBox();
  if (cover === null || canvas === null) return false;
  return (
    cover.x <= canvas.x + 0.5 &&
    cover.y <= canvas.y + 0.5 &&
    cover.x + cover.width >= canvas.x + canvas.width - 0.5 &&
    cover.y + cover.height >= canvas.y + canvas.height - 0.5
  );
}

// Planned E2E test 1 (A22).
test.describe('A22 start screen', () => {
  test('appears on load, Enter starts the game and a piece falls', async ({ page }) => {
    await page.goto('/?seed=1');
    await expect(page.locator(START_SCREEN)).toBeVisible();
    await expect(page.locator(START_SCREEN)).toContainText('Purrfect Lines');
    expect((await readState(page)).screen).toBe('start');

    await page.keyboard.press('Enter');
    await waitForScreen(page, 'playing');
    await expect(page.locator(START_SCREEN)).toBeHidden();
    const first = await readState(page);
    expect(first.active).not.toBeNull();
    await expect.poll(() => readState(page).then(lowestRow)).toBeGreaterThan(lowestRow(first));
  });
});

// Planned E2E test 3 (A23, A24).
test.describe('A23 pause', () => {
  test('P pauses and covers the field, time stands, P continues', async ({ page }) => {
    await startGame(page, '/?seed=1');
    await page.keyboard.press('p');
    await waitForScreen(page, 'paused');
    await expect(page.locator(PAUSE_SCREEN)).toBeVisible();
    expect(await coversCanvas(page, PAUSE_SCREEN)).toBe(true);

    const paused = activeCells(await readState(page));
    // Longer than a fall step on level 1.
    await page.waitForTimeout(1500);
    expect(activeCells(await readState(page))).toEqual(paused);

    await page.keyboard.press('p');
    await waitForScreen(page, 'playing');
    await expect(page.locator(PAUSE_SCREEN)).toBeHidden();
    expect(activeCells(await readState(page))).toEqual(paused);
  });

  test('Esc pauses and continues, Enter on the first menu entry continues', async ({ page }) => {
    await startGame(page, '/?seed=1');
    await page.keyboard.press('Escape');
    await waitForScreen(page, 'paused');
    await page.keyboard.press('Escape');
    await waitForScreen(page, 'playing');

    await page.keyboard.press('p');
    await waitForScreen(page, 'paused');
    await page.keyboard.press('Enter');
    await waitForScreen(page, 'playing');
  });

  test('holding P after continuing does not pause again', async ({ page }) => {
    await startGame(page, '/?seed=1');
    await page.keyboard.press('p');
    await waitForScreen(page, 'paused');
    await page.keyboard.down('p');
    await waitForScreen(page, 'playing');
    // A second down without up is the key repeat of the operating system.
    await page.keyboard.down('p');
    await page.waitForTimeout(200);
    expect((await readState(page)).screen).toBe('playing');
    await page.keyboard.up('p');
  });
});

test.describe('A24 pause on focus loss', () => {
  test('losing the window focus pauses, and the game stays paused on return', async ({ page }) => {
    await startGame(page, '/?seed=1');
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await waitForScreen(page, 'paused');
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.waitForTimeout(300);
    expect((await readState(page)).screen).toBe('paused');
  });

  test('hiding the tab pauses', async ({ page }) => {
    await startGame(page, '/?seed=1');
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitForScreen(page, 'paused');
  });
});

// Planned E2E test 5 (A25).
test.describe('A25 giving up', () => {
  test('giving up in the pause menu leads to the game over screen', async ({ page }) => {
    await startGame(page, '/?seed=1');
    await page.keyboard.press('Space');
    await expect.poll(() => readState(page).then((s) => s.score)).toBeGreaterThan(0);
    await page.keyboard.press('p');
    await waitForScreen(page, 'paused');
    const { score } = await readState(page);

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await waitForScreen(page, 'gameOver');
    await expect(page.locator(GAME_OVER_SCREEN)).toBeVisible();
    await expect(page.locator('#game-over-score')).toHaveText(String(score));
  });
});

// Planned E2E test 4 (A5, A26).
test.describe('A26 game over screen', () => {
  test('shows score, lines and level of the game', async ({ page }) => {
    await startGame(page, '/?seed=1');
    await playUntilGameOver(page);
    const state = await readState(page);
    await expect(page.locator(GAME_OVER_SCREEN)).toBeVisible();
    await expect(page.locator('#game-over-score')).toHaveText(String(state.score));
    await expect(page.locator('#game-over-lines')).toHaveText(String(state.lines));
    await expect(page.locator('#game-over-level')).toHaveText(String(state.level));
  });

  // A game without points never enters the high score list (A29), so this
  // path stays valid once name entry exists.
  test('Enter after a game without points leads to the start screen, Enter again starts a fresh game', async ({
    page,
  }) => {
    await startGame(page, '/?seed=1');
    await page.keyboard.press('p');
    await waitForScreen(page, 'paused');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await waitForScreen(page, 'gameOver');
    expect((await readState(page)).score).toBe(0);

    await page.keyboard.press('Enter');
    await waitForScreen(page, 'start');
    await expect(page.locator(START_SCREEN)).toBeVisible();

    await page.keyboard.press('Enter');
    await waitForScreen(page, 'playing');
    const fresh = await readState(page);
    expect(fresh.score).toBe(0);
    expect(fresh.active).not.toBeNull();
  });
});

interface Fit {
  noScrollbars: boolean;
  inside: boolean;
  centred: boolean;
  filled: number;
  ratio: number;
}

/** How the canvas sits in the current viewport. */
async function measureFit(page: Page): Promise<Fit> {
  return page.evaluate(() => {
    const root = document.documentElement;
    const canvas = document.querySelector('canvas');
    if (canvas === null) throw new Error('No canvas');
    const box = canvas.getBoundingClientRect();
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      noScrollbars: root.scrollWidth <= root.clientWidth && root.scrollHeight <= root.clientHeight,
      inside: box.left >= 0 && box.top >= 0 && box.right <= width && box.bottom <= height,
      centred: Math.abs(box.left - (width - box.right)) <= 1 && Math.abs(box.top - (height - box.bottom)) <= 1,
      filled: Math.max(box.width / width, box.height / height),
      ratio: box.width / box.height,
    };
  });
}

// Planned E2E test 9 (A31).
test.describe('A31 window size', () => {
  test('the game area fits two window sizes without scrollbars', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await startGame(page, '/?seed=1');
    const wide = await measureFit(page);
    expect(wide.noScrollbars).toBe(true);
    expect(wide.inside).toBe(true);
    expect(wide.centred).toBe(true);
    expect(wide.filled).toBeGreaterThan(0.9);

    // Resized without reloading: the game area adapts at once.
    await page.setViewportSize({ width: 500, height: 900 });
    await expect.poll(() => measureFit(page).then((f) => f.inside && f.centred)).toBe(true);
    const tall = await measureFit(page);
    expect(tall.noScrollbars).toBe(true);
    expect(tall.filled).toBeGreaterThan(0.9);
    expect(tall.ratio).toBeCloseTo(wide.ratio, 2);
  });
});

test.describe('A31 sharp drawing', () => {
  test.use({ deviceScaleFactor: 1.5 });

  test('the canvas has one pixel per device pixel', async ({ page }) => {
    await startGame(page, '/?seed=1');
    const sizes = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas === null) throw new Error('No canvas');
      const box = canvas.getBoundingClientRect();
      return { pixels: canvas.width, devicePixels: box.width * window.devicePixelRatio };
    });
    expect(Math.abs(sizes.pixels - sizes.devicePixels)).toBeLessThanOrEqual(1);
  });
});
