# AI-powered End-to-End Test Generator (Next.js + Playwright)

## Quickstart
```bash
npm install / yarn install
npx playwright install 
npm run dev / yar dev
```

## Requirements:
1. Create a file in your project root  .env
2. .env content file has to have this key:
   AZURE_AI_API_KEY=<your_api_key>
   AZURE_AI_AGENT_ID=<the-main-ai-agent-id>
   AZURE_AI_ENDPOINT=<your-azure-ai-endpoint>
   AZURE_AI_MODEL_DEPLOYMENT=gpt-4o
3. You have to login your device to azure portal. 
   For this you have to install Azure CLI on your device.
   Follow this steps: https://learn.microsoft.com/en-us/cli/azure/authenticate-azure-cli-interactively?view=azure-cli-latest


## How it works
1. Enter a URL + scenario in the chat and submit.
2. Backend (`/api/generate`) generates Playwright test code using:
   - **Mock mode** (default), or
   - **Azure mode** (set the toggle, requires `.env` values).
3. Code is saved under `src/generated/test-*.spec.js`.
4. The server runs `npx playwright test <file>` with JSON reporter and returns results.
5. UI shows both the generated code and results.

> Note: Running Playwright from a Next.js route requires Node runtime and is intended for local/dev usage.
