import { defineConfig, devices } from '@playwright/test'

// Настоящий браузер поверх dev-приложения — специально для того, что jsdom-тесты (vitest + RTL)
// физически не могут проверить: реальные CSS media queries / переключение раскладки по ширине
// вьюпорта, реальный localStorage, переживающий перезагрузку страницы. См. docs/plan.md (шаг 6) —
// там объяснено, почему это не входит в component/integration-тесты.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // В CI — html-отчёт как артефакт для разбора упавших тестов; локально — компактный список.
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    // /HelloClient/ — тот же base, что и в vite.config.ts (GitHub Pages); dev-сервер отдаёт
    // приложение с того же подпути, что и прод.
    baseURL: 'http://localhost:5173/HelloClient/',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/HelloClient/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
