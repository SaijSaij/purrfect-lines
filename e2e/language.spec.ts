// Choosing the language (M8). Every test gets a fresh browser context, so
// localStorage starts empty; the browser language comes from `locale`.
import { expect, test, type Page } from '@playwright/test';
import { startGame, waitForScreen } from './support/game';

const START_SCREEN = '#start-screen';

/** Waits until the game has set up its test interface, then for the start screen. */
async function waitForStartScreen(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => '__purrfectLines' in window), {
      message: 'window.__purrfectLines should exist',
    })
    .toBe(true);
  await waitForScreen(page, 'start');
}

async function openStartScreen(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStartScreen(page);
}

/** The visible text of the start screen; hidden parts are left out. */
function startScreenText(page: Page): Promise<string> {
  return page.locator(START_SCREEN).innerText();
}

/** The language of the page, as set on the <html> element. */
async function pageLanguage(page: Page): Promise<string> {
  return page.evaluate(() => document.documentElement.lang);
}

async function expectLanguage(page: Page, language: string): Promise<void> {
  await expect.poll(() => pageLanguage(page)).toBe(language);
}

test.describe('A38 start language', () => {
  test.describe('with a German browser', () => {
    test.use({ locale: 'de-DE' });

    test('starts in German', async ({ page }) => {
      await openStartScreen(page);
      await expectLanguage(page, 'de');
    });
  });

  test.describe('with an English browser', () => {
    test.use({ locale: 'en-US' });

    test('starts in English', async ({ page }) => {
      await openStartScreen(page);
      await expectLanguage(page, 'en');
    });
  });
});

// Planned E2E test 8 (A38).
test.describe('A38 switching the language', () => {
  test.use({ locale: 'en-US' });

  test('L switches the language on the start screen, and it stays after a reload', async ({ page }) => {
    await openStartScreen(page);
    const english = await startScreenText(page);

    await page.keyboard.press('l');
    await expectLanguage(page, 'de');
    await expect.poll(() => startScreenText(page)).not.toBe(english);
    const german = await startScreenText(page);

    await page.reload();
    await waitForStartScreen(page);
    await expectLanguage(page, 'de');
    await expect.poll(() => startScreenText(page)).toBe(german);

    await page.keyboard.press('L');
    await expectLanguage(page, 'en');
    await expect.poll(() => startScreenText(page)).toBe(english);
  });

  test('L does not switch the language during a game or in the pause', async ({ page }) => {
    await startGame(page, '/?seed=1');
    await page.keyboard.press('l');
    await page.keyboard.press('p');
    await waitForScreen(page, 'paused');
    await page.keyboard.press('l');
    await expectLanguage(page, 'en');
  });
});
