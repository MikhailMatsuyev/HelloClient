import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import App from './App'

// App использует HashRouter (реальный window.location.hash) и реальный localStorage —
// изолируем тесты друг от друга, чтобы порядок запуска не влиял на результат.
function resetGlobalState() {
  window.location.hash = ''
  localStorage.clear()
}

describe('App', () => {
  beforeEach(resetGlobalState)
  afterEach(resetGlobalState)

  it('рендерит навигацию и стартовую страницу Trends (редирект с "/")', () => {
    render(<App />)

    expect(screen.getAllByRole('link', { name: /trends/i }).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Trends' })).toBeInTheDocument()
  })

  it('десктопный и мобильный сайдбары рендерятся одновременно — запросы скоупятся по nav', () => {
    render(<App />)

    const desktopNav = screen.getByRole('navigation', { name: 'Основная навигация' })
    const mobileNav = screen.getByRole('navigation', { name: 'Мобильная навигация' })

    expect(within(desktopNav).getByRole('link', { name: 'Trends' })).toBeInTheDocument()
    expect(within(mobileNav).getByRole('link', { name: 'Trends' })).toBeInTheDocument()
  })

  it('клик по пункту в десктопном сайдбаре переходит на другую страницу', async () => {
    const user = userEvent.setup()
    render(<App />)

    const desktopNav = screen.getByRole('navigation', { name: 'Основная навигация' })
    await user.click(within(desktopNav).getByRole('link', { name: 'Payments' }))

    expect(screen.getByRole('heading', { name: 'Payments' })).toBeInTheDocument()
  })

  it('persist: collapsed сохраняется в localStorage и применяется при следующем монтировании', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    const desktopNav = screen.getByRole('navigation', { name: 'Основная навигация' })
    await user.click(within(desktopNav).getByRole('button', { name: 'Свернуть меню' }))
    expect(localStorage.getItem('menu-collapsed')).toBe('true')
    unmount()

    render(<App />)
    const desktopNavAfterRemount = screen.getByRole('navigation', { name: 'Основная навигация' })
    expect(
      within(desktopNavAfterRemount).getByRole('button', { name: 'Развернуть меню' }),
    ).toBeInTheDocument()
  })

  it('openValue общий для десктопного и мобильного Menu.Root — осознанная связанность, не баг', async () => {
    const user = userEvent.setup()
    render(<App />)

    const desktopNav = screen.getByRole('navigation', { name: 'Основная навигация' })
    const mobileNav = screen.getByRole('navigation', { name: 'Мобильная навигация' })

    await user.click(within(desktopNav).getByRole('button', { name: 'Inventory' }))

    expect(within(desktopNav).getByRole('button', { name: 'Inventory' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(within(mobileNav).getByRole('button', { name: 'Inventory' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('без нарушений accessibility на стартовой странице', async () => {
    const { container } = render(<App />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
