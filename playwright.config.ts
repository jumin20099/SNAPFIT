import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests',
  webServer: {
    command: 'npm run start:e2e',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 300_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
}); 