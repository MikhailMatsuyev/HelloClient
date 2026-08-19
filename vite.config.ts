import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages для проектного репозитория (не user/org page) отдаёт сайт с подпути
  // /<имя-репозитория>/ — без этого base все ассеты в проде резолвились бы от корня домена
  // и 404-лись. HashRouter (см. src/App.tsx) — та же причина: без него саб-путь роутов
  // конфликтовал бы с этим base на статическом хостинге без серверных rewrite-правил.
  base: '/HelloClient/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // e2e/ — тесты на @playwright/test (свой раннер, свой API test/expect), не на vitest;
    // дефолтный include vitest иначе подхватил бы и их тоже.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
