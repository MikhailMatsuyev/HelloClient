// Подключает jest-dom матчеры (toBeInTheDocument и т.п.) к vitest expect.
import '@testing-library/jest-dom/vitest'

import { afterEach, expect } from 'vitest'
import { cleanup } from '@testing-library/react'
import type { AxeResults } from 'axe-core'

// vitest-axe@0.1.0 в этой версии пакета не работает: "vitest-axe/extend-expect" собран пустым
// файлом (0 байт) и ничего не регистрирует, а его же "vitest-axe/matchers" в .d.ts помечен как
// export type (хотя рантайм — обычная функция), из-за verbatimModuleSyntax импортировать как
// значение нельзя. Проще и надёжнее написать матчер самим поверх результата axe() — он всего
// в одну проверку длиной, а `axe()` из 'vitest-axe' работает нормально (используется в тестах).
expect.extend({
  toHaveNoViolations(results: AxeResults) {
    const { violations } = results
    const pass = violations.length === 0
    return {
      pass,
      message: () =>
        pass
          ? 'expected accessibility violations, but none were found'
          : `expected no accessibility violations, found ${violations.length}:\n` +
            violations.map((v) => `- ${v.id}: ${v.help} (${v.helpUrl})`).join('\n'),
    }
  },
})

// RTL авто-подключает cleanup только если находит глобальный afterEach; у нас test.globals
// не включён (импортируем afterEach/describe/it из 'vitest' явно), поэтому регистрируем сами —
// иначе DOM от предыдущего теста в том же файле остаётся смонтированным и ломает getByRole.
afterEach(() => {
  cleanup()
})

// jsdom не реализует window.matchMedia вообще — используется в useMatchMedia (headless-пакет)
// и, через него, в src/demo/useSidebarState.ts. Дефолтный стаб "ничего не совпадает" достаточен
// для всех тестов, которые не тестируют сам matchMedia специально (те мокают его сами, см.
// src/headless-menu/useMatchMedia.test.ts).
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}
