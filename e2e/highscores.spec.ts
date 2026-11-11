// High score list (M5): name entry, list on the start screen, saving.
// Every test gets a fresh browser context, so localStorage starts empty.
import { expect, test, type Page } from '@playwright/test';
import { readState, playUntilGameOver, startGame, waitForScreen } from './support/game';

const START_SCREEN = '#start-screen';
const NAME_INPUT = '#name-input';
const HIGHSCORE_SCREEN = '#highscore-screen';
const STORAGE_HINT = '#storage-hint';

/** Plays a game with ?seed=1 to its end (with points) and opens the name entry. */
async function reachNameEntry(page: Page): Promise<number> {
  await startGame(page, '/?seed=1');
  await playUntilGameOver(page);
  const { score } = await readState(page);
  expect(score).toBeGreaterThan(0);
  await page.keyboard.press('Enter');
  await waitForScreen(page, 'nameEntry');
  await expect(page.locator(NAME_INPUT)).toBeFocused();
  return score;
}

/** Saves the name typed so far and goes on to the start screen. */
async function saveAndReturn(page: Page): Promise<void> {
  await page.keyboard.press('Enter');
  await waitForScreen(page, 'highscores');
  await page.keyboard.press('Enter');
  await waitForScreen(page, 'start');
}

// Planned E2E test 6 (A27, A28, A30).
test.describe('A27 A28 A30 high score list', () => {
  test('the start screen says the list is empty before the first game', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(START_SCREEN)).toContainText('No entries yet');
    await expect(page.locator(STORAGE_HINT)).toBeHidden();
  });

  test('a saved name appears highlighted, then on the start screen, and stays after reload', async ({
    page,
  }) => {
    const score = await reachNameEntry(page);
    await expect(page.locator(NAME_INPUT)).toHaveValue('');
    // Game keys such as Space and Q are only text in the name field.
    await page.keyboard.type('Q Cat');
    await expect(page.locator(NAME_INPUT)).toHaveValue('Q Cat');

    await page.keyboard.press('Enter');
    await waitForScreen(page, 'highscores');
    const highlighted = page.locator(`${HIGHSCORE_SCREEN} [aria-current="true"]`);
    await expect(highlighted).toHaveCount(1);
    await expect(highlighted).toContainText('Q Cat');
    await expect(highlighted).toContainText(String(score));

    await page.keyboard.press('Enter');
    await waitForScreen(page, 'start');
    await expect(page.locator(START_SCREEN)).toContainText('Q Cat');

    await page.reload();
    await waitForScreen(page, 'start');
    await expect(page.locator(START_SCREEN)).toContainText('Q Cat');
    await expect(page.locator(START_SCREEN)).toContainText(String(score));
  });

  test('an empty name is saved as Kitty', async ({ page }) => {
    await reachNameEntry(page);
    await saveAndReturn(page);
    await expect(page.locator(START_SCREEN)).toContainText('Kitty');
  });

  test('the name field takes at most 12 characters', async ({ page }) => {
    await reachNameEntry(page);
    await page.keyboard.type('ABCDEFGHIJKLMNOP');
    await expect(page.locator(NAME_INPUT)).toHaveValue('ABCDEFGHIJKL');
  });

  test('Esc skips the name entry and saves nothing', async ({ page }) => {
    await reachNameEntry(page);
    await page.keyboard.type('Nobody');
    await page.keyboard.press('Escape');
    await waitForScreen(page, 'start');
    await expect(page.locator(START_SCREEN)).toContainText('No entries yet');
    await expect(page.locator(START_SCREEN)).not.toContainText('Nobody');

    await page.reload();
    await waitForScreen(page, 'start');
    await expect(page.locator(START_SCREEN)).toContainText('No entries yet');
  });

  test('the next name entry is prefilled with the last name', async ({ page }) => {
    await reachNameEntry(page);
    await page.keyboard.type('Mia');
    await saveAndReturn(page);

    await page.reload();
    await reachNameEntry(page);
    await expect(page.locator(NAME_INPUT)).toHaveValue('Mia');
  });
});

test.describe('A30 without storage', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('Storage is blocked', 'SecurityError');
        },
      });
    });
  });

  test('the game runs, shows a hint and keeps the list until reload', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(STORAGE_HINT)).toBeVisible();

    await reachNameEntry(page);
    await page.keyboard.type('Mia');
    await saveAndReturn(page);
    await expect(page.locator(START_SCREEN)).toContainText('Mia');
    await expect(page.locator(STORAGE_HINT)).toBeVisible();
  });
});
