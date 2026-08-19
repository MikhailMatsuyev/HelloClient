// vitest-axe (0.1.0) описывает свой матчер через устаревший механизм расширения типов
// (`namespace Vi { interface Assertion }`), который Vitest 4 больше не подхватывает — новый
// способ расширения типов через `declare module 'vitest'` описан в доках Vitest. Раз рантайм-
// поведение (expect(...).toHaveNoViolations()) уже работает через extend-expect.js, не хватает
// только типа — дописываем его сами, тем же способом, что jest-dom/vitest использует для своих.
import 'vitest'

interface CustomMatchers<R = unknown> {
  toHaveNoViolations(): R
}

// Канонический паттерн расширения матчеров из доков Vitest: пустое тело интерфейса специально,
// всё содержимое — в extends.
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
