// Подключает jest-dom матчеры (toBeInTheDocument и т.п.) к vitest expect.
import '@testing-library/jest-dom/vitest'

import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// RTL авто-подключает cleanup только если находит глобальный afterEach; у нас test.globals
// не включён (импортируем afterEach/describe/it из 'vitest' явно), поэтому регистрируем сами —
// иначе DOM от предыдущего теста в том же файле остаётся смонтированным и ломает getByRole.
afterEach(() => {
  cleanup()
})
