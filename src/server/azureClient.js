/**
 * Minimal Azure AI Foundry Agent client.
 * Reads env: AZURE_AI_API_KEY, AZURE_AI_AGENT_ID, AZURE_AI_ENDPOINT
 * Exposes askAzureAgent(url, scenario) -> { code, meta }
 */
export async function askAzureAgent(url, scenario) {
  const apiKey = process.env.AZURE_AI_API_KEY;
  const agentId = process.env.AZURE_AI_AGENT_ID;
  const endpoint = process.env.AZURE_AI_ENDPOINT;

  if (!apiKey || !agentId || !endpoint) {
    throw new Error('Azure credentials are missing. Check .env.');
  }

  // This is a generic shape; adapt to your actual Azure AI Foundry Agents API.
  const payload = {
    agent_id: agentId,
    input: {
      url,
      scenario,
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      // Ensure Node runtime fetch
      cache: 'no-store',
    });
    console.log('>>> payload:', payload);
    console.log('>>> res:', res);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Azure request failed: ${res.status} ${text}`);
    }
    const data = await res.json();

    // Expect `data.code` to be Playwright JS test code.
    // If your agent returns a different shape, map it here.
    if (!data.code) {
      // Fallback: build a very simple test from agent summary if needed
      const code = `import { test, expect } from '@playwright/test';
test('Generated test for ${url}', async ({ page }) => {
  await page.goto('${url}');
  await expect(page).toHaveURL(/.*/);
});`;
      return { code, meta: data };
    }
    return { code: data.code, meta: data };
  } catch (err) {
    // Bubble up for the API route to handle.
    throw err;
  }
}
