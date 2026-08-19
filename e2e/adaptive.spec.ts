import { test, expect } from '@playwright/test'

// Эти два теста проверяют ровно то, что vitest+jsdom (src/App.test.tsx и т.п.) не может: реальные
// CSS media queries и настоящий localStorage, переживающий перезагрузку страницы в браузере.

test('переключает десктопный сайдбар и мобильный таб-бар по реальной ширине вьюпорта', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')

  const desktopNav = page.getByRole('navigation', { name: 'Основная навигация' })
  const mobileNav = page.getByRole('navigation', { name: 'Мобильная навигация' })

  // Оба Menu.Root всегда смонтированы (см. src/demo/Sidebar.tsx) — переключение между ними
  // чисто CSS (`hidden md:flex` / `md:hidden`), поэтому только настоящий браузер может
  // подтвердить, что видим именно тот, что нужно, а не оба/ни одного.
  await expect(desktopNav).toBeVisible()
  await expect(mobileNav).toBeHidden()

  await page.setViewportSize({ width: 390, height: 800 })
  await expect(mobileNav).toBeVisible()
  await expect(desktopNav).toBeHidden()
})

test('свёрнутость сайдбара сохраняется в localStorage и переживает перезагрузку страницы', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')

  const desktopNav = page.getByRole('navigation', { name: 'Основная навигация' })
  const toggle = desktopNav.getByRole('button', { name: 'Свернуть меню' })
  await toggle.click()

  await expect(desktopNav.getByRole('button', { name: 'Развернуть меню' })).toBeVisible()
  await expect(page.evaluate(() => localStorage.getItem('menu-collapsed'))).resolves.toBe('true')

  await page.reload()
  await expect(
    page.getByRole('navigation', { name: 'Основная навигация' }).getByRole('button', {
      name: 'Развернуть меню',
    }),
  ).toBeVisible()
})
