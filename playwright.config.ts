import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  workers: 2,
  maxFailures: 2,
  reporter: [['./reporters/mask-secrets.ts'], ['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://api.github.com',
  },
});
