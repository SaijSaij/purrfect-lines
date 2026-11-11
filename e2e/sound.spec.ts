// Switching music and sounds (M6). Every test gets a fresh browser context,
// so localStorage starts empty.
import { expect, test, type Page } from '@playwright/test';
import { playUntilGameOver, readState, startGame, waitForScreen } from './support/game';

const SETTINGS_KEY = 'purrfect-lines.settings';
const NAME_INPUT = '#name-input';

interface SoundSettings {
  music?: unknown;
  sounds?: unknown;
}

/** The saved sound settings, or null if nothing is saved yet. */
async function savedSettings(page: Page): Promise<SoundSettings | null> {
  const raw = await page.evaluate((key) => window.localStorage.getItem(key), SETTINGS_KEY);
  return raw === null ? null : (JSON.parse(raw) as SoundSettings);
}

async function expectSaved(page: Page, expected: { music: boolean; sounds: boolean }): Promise<void> {
  await expect
    .poll(async () => {
      const settings = await savedSettings(page);
      return { music: settings?.music, sounds: settings?.sounds };
    })
    .toEqual(expected);
}

async function openStartScreen(page: Page): Promise<void> {
  await page.goto('/');
  await waitForScreen(page, 'start');
}

// Planned E2E test 7 (A34).
test.describe('A34 switching sound', () => {
  test('M switches the music and N the sounds, each on its own', async ({ page }) => {
    await openStartScreen(page);
    await page.keyboard.press('m');
    await expectSaved(page, { music: false, sounds: true });
    await page.keyboard.press('n');
    await expectSaved(page, { music: false, sounds: false });
    await page.keyboard.press('M');
    await expectSaved(page, { music: true, sounds: false });
  });

  test('the switched state stays after a reload', async ({ page }) => {
    await openStartScreen(page);
    await page.keyboard.press('m');
    await expectSaved(page, { music: false, sounds: true });

    await page.reload();
    await waitForScreen(page, 'start');
    // The game starts from the saved state: M now switches the music back on.
    await page.keyboard.press('m');
    await expectSaved(page, { music: true, sounds: true });
  });

  test('M and N work during a game and in the pause', async ({ page }) => {
    await startGame(page, '/?seed=1');
    await page.keyboard.press('m');
    await expectSaved(page, { music: false, sounds: true });
    expect((await readState(page)).screen).toBe('playing');

    await page.keyboard.press('p');
    await waitForScreen(page, 'paused');
    await page.keyboard.press('n');
    await expectSaved(page, { music: false, sounds: false });
    expect((await readState(page)).screen).toBe('paused');
  });

  test('M and N are only text in the name entry', async ({ page }) => {
    await startGame(page, '/?seed=1');
    await playUntilGameOver(page);
    await page.keyboard.press('Enter');
    await waitForScreen(page, 'nameEntry');
    await page.keyboard.type('mn');
    await expect(page.locator(NAME_INPUT)).toHaveValue('mn');
    const settings = await savedSettings(page);
    expect(settings?.music ?? true).toBe(true);
    expect(settings?.sounds ?? true).toBe(true);
  });
});
