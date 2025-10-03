// Auto-generated Playwright test (mock)
import { test, expect } from '@playwright/test';

test.describe('AI-generated scenario', () => {
  test('Scenario: can you find the login button', async ({ page }) => {
    await page.goto('https://demo.testfire.net');
    // Basic checks
    await expect(page).toHaveURL(/https://demo.testfire.net/);
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
