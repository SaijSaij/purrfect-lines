import { expect, test } from '@playwright/test';
import { leftmostColumn, readState, startGame, type PurrfectLinesState } from './support/game';

/** Whether the falling piece is wider than tall (rotation states 0 and 2 of all but the square). */
function isWide(state: PurrfectLinesState): boolean {
  const cells = state.active?.cells ?? [];
  const width = new Set(cells.map((c) => c.x)).size;
  const height = new Set(cells.map((c) => c.y)).size;
  return width > height;
}

test.describe('A43 test interface', () => {
  test('exposes the game state', async ({ page }) => {
    const state = await startGame(page, '/?seed=1');
    expect(state.screen).toBe('playing');
    expect(state.board).toHaveLength(20);
    for (const row of state.board) expect(row).toHaveLength(10);
    expect(state.active?.cells).toHaveLength(4);
    expect(['I', 'O', 'T', 'S', 'Z', 'L', 'J']).toContain(state.active?.type);
    expect(['I', 'O', 'T', 'S', 'Z', 'L', 'J']).toContain(state.next);
    expect(state.score).toBe(0);
    expect(state.lines).toBe(0);
    expect(state.level).toBe(1);
  });
});

test.describe('A39 fixed seed', () => {
  test('the same seed gives the same first pieces', async ({ page }) => {
    const first = await startGame(page, '/?seed=1');
    const second = await startGame(page, '/?seed=1');
    expect(second.active?.type).toBe(first.active?.type);
    expect(second.next).toBe(first.next);
  });
});

// Planned E2E test 2, for now without points (A12, A21).
test('an arrow key moves the piece and the space bar drops it to the bottom', async ({ page }) => {
  const start = await startGame(page, '/?seed=1');

  await page.keyboard.press('ArrowLeft');
  await expect
    .poll(() => readState(page).then(leftmostColumn))
    .toBe(leftmostColumn(start) - 1);

  await page.keyboard.press('Space');
  await expect
    .poll(() => readState(page).then((s) => s.board[19]?.some((cell) => cell !== null)))
    .toBe(true);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

// A held move key must not keep repeating when its key-up is lost because
// the window lost focus (A7).
test('a held key stops repeating when the window loses focus', async ({ page }) => {
  const start = await startGame(page, '/?seed=1');
  await page.keyboard.down('ArrowRight');
  await expect
    .poll(() => readState(page).then(leftmostColumn))
    .toBeGreaterThan(leftmostColumn(start));
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  const afterBlur = leftmostColumn(await readState(page));
  // Longer than the repeat delay, shorter than one fall step.
  await page.waitForTimeout(500);
  expect(leftmostColumn(await readState(page))).toBe(afterBlur);
  await page.keyboard.up('ArrowRight');
});

// A second key for the same action is a new press (A8, A21): X rotates again
// while ↑ is still held.
test('a second rotation key rotates again while the first is held', async ({ page }) => {
  let state = await startGame(page, '/?seed=1');
  // The square looks the same in every rotation state, so drop it first.
  if (state.active?.type === 'O') {
    await page.keyboard.press('Space');
    await expect.poll(() => readState(page).then((s) => s.active?.type)).not.toBe('O');
    state = await readState(page);
  }
  expect(isWide(state)).toBe(true);
  await page.keyboard.down('ArrowUp');
  await expect.poll(() => readState(page).then(isWide)).toBe(false);
  await page.keyboard.press('x');
  await expect.poll(() => readState(page).then(isWide)).toBe(true);
  await page.keyboard.up('ArrowUp');
});

// Planned E2E test 4 (A5).
test('a game with only hard drops ends', async ({ page }) => {
  await startGame(page, '/?seed=1');
  // Pieces only ever land in the middle columns, so no row is completed
  // and the stack reaches the top after a few pieces.
  for (let i = 0; i < 60; i++) {
    if ((await readState(page)).screen === 'gameOver') break;
    await page.keyboard.press('Space');
  }
  await expect.poll(() => readState(page).then((s) => s.screen)).toBe('gameOver');
});

// Enter leads from game over back into a running game. Later milestones put
// screens in between (start screen, name entry), so Enter may take a few presses.
test('Enter after game over leads to a new game', async ({ page }) => {
  await startGame(page, '/?seed=1');
  for (let i = 0; i < 60; i++) {
    if ((await readState(page)).screen === 'gameOver') break;
    await page.keyboard.press('Space');
  }
  await expect.poll(() => readState(page).then((s) => s.screen)).toBe('gameOver');
  for (let i = 0; i < 5; i++) {
    const before = (await readState(page)).screen;
    if (before === 'playing') break;
    await page.keyboard.press('Enter');
    await expect.poll(() => readState(page).then((s) => s.screen)).not.toBe(before);
  }
  const state = await readState(page);
  expect(state.screen).toBe('playing');
  expect(state.board.flat().every((cell) => cell === null)).toBe(true);
});
