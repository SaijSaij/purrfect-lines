import { expect, test } from '@playwright/test';

test('page loads with the game title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Purrfect Lines');
});
