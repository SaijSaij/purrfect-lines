// Choosing the language (M8). Every test gets a fresh browser context, so
// localStorage starts empty; the browser language comes from `locale`.
import { expect, test, type Page } from '@playwright/test';
import { TEXTS } from '../src/i18n/texts';
import { startGame, waitForScreen } from './support/game';

const START_SCREEN = '#start-screen';

async function openStartScreen(page: Page): Promise<void> {
  await page.goto('/');
  await waitForScreen(page, 'start');
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
      await expect(page.locator(START_SCREEN)).toContainText(TEXTS.de.pressEnterToStart);
    });
  });

  test.describe('with an English browser', () => {
    test.use({ locale: 'en-US' });

    test('starts in English', async ({ page }) => {
      await openStartScreen(page);
      await expectLanguage(page, 'en');
      await expect(page.locator(START_SCREEN)).toContainText(TEXTS.en.pressEnterToStart);
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
    await waitForScreen(page, 'start');
    await expectLanguage(page, 'de');
    await expect.poll(() => startScreenText(page)).toBe(german);

    await page.keyboard.press('L');
    await expectLanguage(page, 'en');
    await expect.poll(() => startScreenText(page)).toBe(english);
  });

  test('Ctrl+L and Alt+L on the start screen do not switch the language', async ({ page }) => {
    await openStartScreen(page);
    await page.keyboard.press('Control+l');
    await expectLanguage(page, 'en');
    await page.keyboard.press('Alt+l');
    await expectLanguage(page, 'en');
    // A plain L afterwards still switches, so the game was ready for keys.
    await page.keyboard.press('l');
    await expectLanguage(page, 'de');
  });

  test('L does not switch the language during a game or in the pause', async ({ page }) => {
    await startGame(page, '/?seed=1');
    await page.keyboard.press('l');
    await expectLanguage(page, 'en');
    await page.keyboard.press('p');
    await waitForScreen(page, 'paused');
    await page.keyboard.press('l');
    await expectLanguage(page, 'en');
  });
});
