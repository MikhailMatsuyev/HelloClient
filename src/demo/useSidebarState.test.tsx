import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Link } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSidebarState } from './useSidebarState'

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}

// Компонент-зонд: рендерит текущий openValue/collapsed в DOM и даёт кнопки/ссылки для их смены,
// чтобы протестировать реальное поведение хука (включая "adjust state during render"), а не
// вызывать его напрямую через renderHook — синхронизация с роутом требует настоящего Router.
function StateProbe() {
  const { collapsed, setCollapsed, openValue, setOpenValue } = useSidebarState()

  return (
    <div>
      <span data-testid="open-value">{openValue ?? 'none'}</span>
      <span data-testid="collapsed">{String(collapsed)}</span>
      <Link to="/inventory/products">Go to inventory</Link>
      <Link to="/trends">Go to trends</Link>
      <button onClick={() => setOpenValue('clients')}>Open clients manually</button>
      <button onClick={() => setCollapsed(!collapsed)}>Toggle collapsed</button>
    </div>
  )
}

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <StateProbe />
    </MemoryRouter>,
  )
}

describe('useSidebarState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('при монтировании openValue сразу совпадает с текущим роутом', () => {
    renderWithRouter('/inventory/products')
    expect(screen.getByTestId('open-value')).toHaveTextContent('inventory')
  })

  it('openValue равен none, если текущий роут не относится ни к одному разделу подменю', () => {
    renderWithRouter('/trends')
    expect(screen.getByTestId('open-value')).toHaveTextContent('none')
  })

  it('переход по ссылке на роут внутри раздела раскрывает его, без лишнего useEffect-рендера', async () => {
    const user = userEvent.setup()
    renderWithRouter('/trends')
    expect(screen.getByTestId('open-value')).toHaveTextContent('none')

    await user.click(screen.getByRole('link', { name: 'Go to inventory' }))
    expect(screen.getByTestId('open-value')).toHaveTextContent('inventory')
  })

  it('переход на роут вне подменю закрывает ранее раскрытый раздел', async () => {
    const user = userEvent.setup()
    renderWithRouter('/inventory/products')
    expect(screen.getByTestId('open-value')).toHaveTextContent('inventory')

    await user.click(screen.getByRole('link', { name: 'Go to trends' }))
    expect(screen.getByTestId('open-value')).toHaveTextContent('none')
  })

  it('ручное открытие раздела (без навигации) не перезаписывается синхронизацией с роутом', async () => {
    const user = userEvent.setup()
    renderWithRouter('/trends')

    await user.click(screen.getByRole('button', { name: 'Open clients manually' }))
    expect(screen.getByTestId('open-value')).toHaveTextContent('clients')

    // pathname не менялся — значение из ручного клика должно устоять.
    expect(screen.getByTestId('open-value')).toHaveTextContent('clients')
  })

  it('collapsed берётся из localStorage и переключение сохраняется', async () => {
    localStorage.setItem('menu-collapsed', JSON.stringify(true))
    const user = userEvent.setup()
    renderWithRouter('/trends')
    expect(screen.getByTestId('collapsed')).toHaveTextContent('true')

    await user.click(screen.getByRole('button', { name: 'Toggle collapsed' }))
    expect(screen.getByTestId('collapsed')).toHaveTextContent('false')
    expect(localStorage.getItem('menu-collapsed')).toBe('false')
  })

  it('без сохранённого значения дефолт collapsed берётся из useMatchMedia (узкий вьюпорт)', () => {
    stubMatchMedia(true)
    renderWithRouter('/trends')
    expect(screen.getByTestId('collapsed')).toHaveTextContent('true')
  })

  it('сохранённое в localStorage значение важнее подсказки useMatchMedia', () => {
    stubMatchMedia(true)
    localStorage.setItem('menu-collapsed', JSON.stringify(false))
    renderWithRouter('/trends')
    expect(screen.getByTestId('collapsed')).toHaveTextContent('false')
  })
})
