# AI-powered End-to-End Test Generator (Next.js + Playwright)

## Quickstart
```bash
npm install
npx playwright install
npm run dev
```

## How it works
1. Enter a URL + scenario in the chat and submit.
2. Backend (`/api/generate`) generates Playwright test code using:
   - **Mock mode** (default), or
   - **Azure mode** (set the toggle, requires `.env` values).
3. Code is saved under `src/generated/test-*.spec.js`.
4. The server runs `npx playwright test <file>` with JSON reporter and returns results.
5. UI shows both the generated code and results.

> Note: Running Playwright from a Next.js route requires Node runtime and is intended for local/dev usage.
