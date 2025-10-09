/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './src/generated',
  reporter: [['list'], ['json']],
  use: {
    headless: false,
  },
};
export default config;
