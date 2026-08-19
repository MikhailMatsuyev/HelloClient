import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Sidebar } from './Sidebar'

interface RenderOptions {
  initialPath?: string
  collapsed?: boolean
}

// Реалистичный controlled-контур: Sidebar не хранит собственный стейт, поэтому оборачиваем его
// в компонент с настоящим useState — так же, как это делает src/App.tsx.
function renderSidebar({ initialPath = '/trends', collapsed = false }: RenderOptions = {}) {
  function Harness() {
    const [isCollapsed, setCollapsed] = useState(collapsed)
    const [openValue, setOpenValue] = useState<string | null>(null)
    return (
      <Sidebar
        collapsed={isCollapsed}
        setCollapsed={setCollapsed}
        openValue={openValue}
        setOpenValue={setOpenValue}
      />
    )
  }

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Harness />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('подсвечивает активный пункт по текущему роуту через aria-current', () => {
    renderSidebar({ initialPath: '/payments' })
    expect(screen.getByRole('link', { name: 'Payments' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Trends' })).not.toHaveAttribute('aria-current')
  })

  it('клик по Menu.Toggle переключает collapsed (controlled через setCollapsed)', async () => {
    const user = userEvent.setup()
    renderSidebar()

    expect(screen.getByRole('button', { name: 'Свернуть меню' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Свернуть меню' }))
    expect(screen.getByRole('button', { name: 'Развернуть меню' })).toBeInTheDocument()
  })

  it('аккордеон: открытие Inventory закрывает ранее открытый Clients', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Clients' }))
    expect(screen.getByRole('button', { name: 'Clients' })).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByRole('button', { name: 'Inventory' }))
    expect(screen.getByRole('button', { name: 'Inventory' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Clients' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('клик по пункту подменю переходит по роуту; подсвечены и пункт, и родитель', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Inventory' }))
    await user.click(screen.getByRole('link', { name: 'Products' }))

    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Inventory' })).toHaveAttribute('data-state', 'open')
  })

  it('раздел, содержащий активную страницу, остаётся подсвечен, даже когда наводят на соседний', async () => {
    const user = userEvent.setup()
    renderSidebar({ initialPath: '/clients/reviews', collapsed: true })

    const clientsTrigger = screen.getByRole('button', { name: 'Clients' })
    expect(clientsTrigger).toHaveAttribute('data-active', '')

    // Наводим на Inventory — его собственный flyout открывается, Clients-flyout закрывается,
    // но data-active на Clients (персистентный сигнал "я всё ещё внутри этого раздела") не гаснет.
    await user.hover(screen.getByRole('button', { name: 'Inventory' }))
    expect(clientsTrigger).toHaveAttribute('data-active', '')
    expect(clientsTrigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('в узком режиме hover по SubTrigger открывает его и закрывает ранее открытый через клик раздел', async () => {
    const user = userEvent.setup()
    renderSidebar({ collapsed: true })

    await user.click(screen.getByRole('button', { name: 'Inventory' }))
    expect(screen.getByRole('button', { name: 'Inventory' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.hover(screen.getByRole('button', { name: 'Clients' }))
    expect(screen.getByRole('button', { name: 'Clients' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Inventory' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('в узком режиме flyout, открытый по hover, закрывается, когда курсор уходит в сторону', async () => {
    const user = userEvent.setup()
    renderSidebar({ collapsed: true })

    await user.hover(screen.getByRole('button', { name: 'Inventory' }))
    expect(screen.getByRole('button', { name: 'Inventory' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    // Курсор уходит совсем в сторону (не на триггер и не на сам flyout) — без hover-intent
    // закрытия flyout остался бы раскрытым навсегда. Закрытие отложено (см. SidebarSubmenu),
    // поэтому ждём его через waitFor, а не проверяем синхронно сразу после unhover.
    await user.unhover(screen.getByRole('button', { name: 'Inventory' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Inventory' })).toHaveAttribute(
        'aria-expanded',
        'false',
      )
    })
  })

  it('flyout, открытый по hover, не закрывается, пока курсор движется с триггера прямо на сам flyout', async () => {
    const user = userEvent.setup()
    renderSidebar({ collapsed: true })

    await user.hover(screen.getByRole('button', { name: 'Inventory' }))
    // Курсор "доехал" до пункта внутри flyout — это должно отменить отложенное закрытие точно
    // так же, как повторное наведение на сам триггер. Раньше (mouseleave прямо на Menu.Sub) это
    // было физически невозможно: flyout вне bounding box родителя, событие срабатывало раньше.
    await user.hover(screen.getByRole('link', { name: 'Products' }))

    // Ждём дольше, чем задержка закрытия (200мс) — flyout должен остаться открытым.
    await new Promise((resolve) => setTimeout(resolve, 300))
    expect(screen.getByRole('button', { name: 'Inventory' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.click(screen.getByRole('link', { name: 'Products' }))
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('aria-current', 'page')
  })

  it('отложенное закрытие одного раздела не закрывает другой, успевший открыться за это время', async () => {
    const user = userEvent.setup()
    renderSidebar({ collapsed: true })

    await user.hover(screen.getByRole('button', { name: 'Inventory' }))
    expect(screen.getByRole('button', { name: 'Inventory' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    // Уходим на Clients быстро (успевает сработать до 200мс таймера Inventory) — Clients
    // открывается сразу же (см. openThis), но отложенное закрытие от Inventory всё ещё "в полёте".
    await user.hover(screen.getByRole('button', { name: 'Clients' }))
    expect(screen.getByRole('button', { name: 'Clients' })).toHaveAttribute('aria-expanded', 'true')

    // Ждём дольше 200мс — если бы таймер Inventory не проверял актуальный openValue (stale
    // closure), он сбросил бы его в null поверх уже легитимно открытого Clients.
    await new Promise((resolve) => setTimeout(resolve, 300))
    expect(screen.getByRole('button', { name: 'Clients' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('в свёрнутом режиме подписи скрыты, но остаётся доступное имя через title', () => {
    renderSidebar({ collapsed: true })

    expect(screen.queryByText('Trends')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Trends' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inventory' })).toBeInTheDocument()
  })

  it('без нарушений accessibility (широкий режим)', async () => {
    const { container } = renderSidebar()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('без нарушений accessibility (узкий режим, с открытым flyout)', async () => {
    const user = userEvent.setup()
    const { container } = renderSidebar({ collapsed: true })
    await user.click(screen.getByRole('button', { name: 'Inventory' }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
