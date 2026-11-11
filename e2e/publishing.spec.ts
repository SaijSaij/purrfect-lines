// Getting ready to be public (M10): the source code line under the game (A46)
// and the hint for devices without a keyboard (A47). Texts are taken from the
// spec on purpose, not from the text table, so a wrong table entry fails here.
import { expect, test, type Page } from '@playwright/test';
import { waitForScreen } from './support/game';

const SOURCE_LINE = '#source-line';
const SOURCE_LINK = `${SOURCE_LINE} a`;
const START_SCREEN = '#start-screen';
const REPOSITORY = 'https://github.com/SaijSaij/purrfect-lines';

const KEYBOARD_HINT_EN = 'This game is played with a physical keyboard – best opened on a computer.';
const KEYBOARD_HINT_DE = 'Gespielt wird mit einer echten Tastatur – am besten am Computer öffnen.';
const PRESS_ENTER_EN = 'Press Enter to start';

async function openStartScreen(page: Page): Promise<void> {
  await page.goto('/?seed=1');
  await waitForScreen(page, 'start');
}

/** Whether the source line is visible and lies completely below the canvas. */
async function lineBelowCanvas(page: Page): Promise<boolean> {
  const line = await page.locator(SOURCE_LINE).boundingBox();
  const canvas = await page.locator('canvas').boundingBox();
  if (line === null || canvas === null) return false;
  return line.height > 0 && line.y >= canvas.y + canvas.height - 0.5;
}

/** The visible text of the start screen; hidden parts are left out. */
function startScreenText(page: Page): Promise<string> {
  return page.locator(START_SCREEN).innerText();
}

async function linkIsFocused(page: Page): Promise<boolean> {
  return page.evaluate((selector) => document.activeElement === document.querySelector(selector), SOURCE_LINK);
}

// Planned E2E test 10 (A46).
test.describe('A46 source code line', () => {
  test.use({ locale: 'en-US' });

  test('stands under the game area on the start screen, during a game and in the pause', async ({ page }) => {
    await openStartScreen(page);
    await expect(page.locator(SOURCE_LINE)).toHaveText('Purrfect Lines · Source code · GPL-3.0');
    expect(await lineBelowCanvas(page)).toBe(true);

    await page.keyboard.press('Enter');
    await waitForScreen(page, 'playing');
    expect(await lineBelowCanvas(page)).toBe(true);

    await page.keyboard.press('p');
    await waitForScreen(page, 'paused');
    expect(await lineBelowCanvas(page)).toBe(true);
  });

  test('links to the repository in a new tab and cannot be reached with Tab', async ({ page }) => {
    await openStartScreen(page);
    const link = page.locator(SOURCE_LINK);
    await expect(link).toHaveCount(1);
    await expect(link).toHaveText('Source code');
    await expect(link).toHaveAttribute('href', REPOSITORY);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /(^|\s)noopener(\s|$)/);
    await expect(link).toHaveAttribute('tabindex', '-1');
  });

  test('L switches the line to German', async ({ page }) => {
    await openStartScreen(page);
    await page.keyboard.press('l');
    await expect(page.locator(SOURCE_LINE)).toHaveText('Purrfect Lines · Quellcode · GPL-3.0');
    await expect(page.locator(SOURCE_LINK)).toHaveText('Quellcode');
    await expect(page.locator(SOURCE_LINK)).toHaveAttribute('href', REPOSITORY);
  });

  test('Tab, then Enter on the start screen starts the game and opens no tab', async ({ page, context }) => {
    await openStartScreen(page);
    await expect(page.locator(SOURCE_LINK)).toHaveCount(1);
    await page.keyboard.press('Tab');
    expect(await linkIsFocused(page)).toBe(false);
    await page.keyboard.press('Enter');
    await waitForScreen(page, 'playing');
    expect(context.pages()).toHaveLength(1);
  });

  test('after a click on the link, Enter opens no second tab and reaches the game', async ({ page, context }) => {
    // Opening the repository needs no network: the new tab is only counted.
    await context.route('https://github.com/**', (route) => route.fulfill({ body: '' }));
    await openStartScreen(page);
    await expect(page.locator(SOURCE_LINK)).toHaveCount(1);
    const opened = context.waitForEvent('page');
    await page.locator(SOURCE_LINK).click();
    await opened;
    expect(context.pages()).toHaveLength(2);

    await page.bringToFront();
    expect(await linkIsFocused(page)).toBe(false);
    await page.keyboard.press('Enter');
    await waitForScreen(page, 'playing');
    expect(context.pages()).toHaveLength(2);
  });
});

// Planned E2E test 11 (A47).
test.describe('A47 keyboard hint', () => {
  test.describe('on a touch device without a fine pointer', () => {
    test.use({ locale: 'en-US', hasTouch: true, isMobile: true, viewport: { width: 412, height: 915 } });

    test('shows the hint instead of "Press Enter to start", in both languages', async ({ page }) => {
      await openStartScreen(page);
      // Precondition: the emulation really hides the fine pointer.
      expect(await page.evaluate(() => matchMedia('(any-pointer: fine)').matches)).toBe(false);
      await expect.poll(() => startScreenText(page)).toContain(KEYBOARD_HINT_EN);
      expect(await startScreenText(page)).not.toContain(PRESS_ENTER_EN);

      await page.keyboard.press('l');
      await expect.poll(() => startScreenText(page)).toContain(KEYBOARD_HINT_DE);
    });

    test('Enter still starts the game with a keyboard attached', async ({ page }) => {
      await openStartScreen(page);
      await expect.poll(() => startScreenText(page)).toContain(KEYBOARD_HINT_EN);
      await page.keyboard.press('Enter');
      await waitForScreen(page, 'playing');
    });
  });

  test.describe('on a desktop with a mouse', () => {
    test.use({ locale: 'en-US' });

    test('shows "Press Enter to start" and no hint', async ({ page }) => {
      await openStartScreen(page);
      await expect.poll(() => startScreenText(page)).toContain(PRESS_ENTER_EN);
      expect(await startScreenText(page)).not.toContain(KEYBOARD_HINT_EN);
    });
  });
});
