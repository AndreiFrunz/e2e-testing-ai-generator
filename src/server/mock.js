export function generateMockPlaywrightTest(url, scenario) {
  const safeScenario = (scenario || 'basic smoke').replace(/`/g, '');
  return `// Auto-generated Playwright test (mock)
import { test, expect } from '@playwright/test';

test.describe('AI-generated scenario', () => {
  test('Scenario: ${safeScenario}', async ({ page }) => {
    await page.goto('${url}');
    // Basic checks
    await expect(page).toHaveURL(/${url.replace(/[-/\\^$*+?.()|[\]{}]/g, r => r)}/);
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
`;
}
