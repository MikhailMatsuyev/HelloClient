import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Menu, useMenuSub } from './index'
import { Slot } from './Slot'

describe('Menu compound components', () => {
  it('рендерит структуру Root/List/Item без собственных стилей', () => {
    render(
      <Menu.Root>
        <Menu.List>
          <Menu.Item>Trends</Menu.Item>
        </Menu.List>
      </Menu.Root>,
    )

    expect(screen.getByRole('button', { name: 'Trends' })).toBeInTheDocument()
  })

  it('Menu.Toggle переключает collapsed-состояние всего меню', async () => {
    const user = userEvent.setup()
    render(
      <Menu.Root>
        <Menu.Toggle>Toggle</Menu.Toggle>
      </Menu.Root>,
    )

    const toggle = screen.getByRole('button', { name: 'Toggle' })
    expect(toggle).toHaveAttribute('data-state', 'expanded')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('data-state', 'collapsed')
  })

  it('data-state на Menu.Root и Menu.List отражает collapsed того же Root', async () => {
    const user = userEvent.setup()
    render(
      <Menu.Root>
        <Menu.List>
          <Menu.Item>Trends</Menu.Item>
        </Menu.List>
        <Menu.Toggle>Toggle</Menu.Toggle>
      </Menu.Root>,
    )

    const nav = screen.getByRole('navigation')
    const list = screen.getByRole('button', { name: 'Trends' }).parentElement
    expect(nav).toHaveAttribute('data-state', 'expanded')
    expect(list).toHaveAttribute('data-state', 'expanded')

    await user.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(nav).toHaveAttribute('data-state', 'collapsed')
    expect(list).toHaveAttribute('data-state', 'collapsed')
  })

  it('Menu.Sub — аккордеон: открытие одного раздела закрывает другой', async () => {
    const user = userEvent.setup()
    render(
      <Menu.Root>
        <Menu.Sub value="inventory">
          <Menu.SubTrigger>Inventory</Menu.SubTrigger>
          <Menu.SubContent>Inventory content</Menu.SubContent>
        </Menu.Sub>
        <Menu.Sub value="clients">
          <Menu.SubTrigger>Clients</Menu.SubTrigger>
          <Menu.SubContent>Clients content</Menu.SubContent>
        </Menu.Sub>
      </Menu.Root>,
    )

    const inventoryTrigger = screen.getByRole('button', { name: 'Inventory' })
    const clientsTrigger = screen.getByRole('button', { name: 'Clients' })
    // Menu.Sub сам оборачивает Trigger+Content — это их общий родитель.
    const inventorySub = inventoryTrigger.parentElement

    await user.click(inventoryTrigger)
    expect(inventoryTrigger).toHaveAttribute('aria-expanded', 'true')
    expect(inventorySub).toHaveAttribute('data-state', 'open')
    expect(screen.getByText('Inventory content')).toHaveAttribute('data-state', 'open')

    await user.click(clientsTrigger)
    expect(clientsTrigger).toHaveAttribute('aria-expanded', 'true')
    expect(inventoryTrigger).toHaveAttribute('aria-expanded', 'false')
    expect(inventorySub).toHaveAttribute('data-state', 'closed')
    expect(screen.getByText('Inventory content')).toHaveAttribute('data-state', 'closed')
  })

  it('SubTrigger.aria-controls указывает на id SubContent (ARIA Disclosure pattern)', () => {
    render(
      <Menu.Root>
        <Menu.Sub value="inventory">
          <Menu.SubTrigger>Inventory</Menu.SubTrigger>
          <Menu.SubContent>Inventory content</Menu.SubContent>
        </Menu.Sub>
      </Menu.Root>,
    )

    const trigger = screen.getByRole('button', { name: 'Inventory' })
    const content = screen.getByText('Inventory content')
    expect(content.id).toBeTruthy()
    expect(trigger).toHaveAttribute('aria-controls', content.id)
  })

  it('Escape закрывает открытое подменю и возвращает фокус на его SubTrigger', async () => {
    const user = userEvent.setup()
    render(
      <Menu.Root>
        <Menu.Sub value="inventory">
          <Menu.SubTrigger>Inventory</Menu.SubTrigger>
          <Menu.SubContent>
            <Menu.Item>Products</Menu.Item>
          </Menu.SubContent>
        </Menu.Sub>
      </Menu.Root>,
    )

    const trigger = screen.getByRole('button', { name: 'Inventory' })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // Фокус ушёл вглубь открытого подменю (обычным Tab) — Escape должен сработать и оттуда.
    await user.tab()
    expect(screen.getByRole('button', { name: 'Products' })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('повторный Escape подряд не ломается — второй раз уже нечего закрывать', async () => {
    const user = userEvent.setup()
    render(
      <Menu.Root>
        <Menu.Sub value="inventory">
          <Menu.SubTrigger>Inventory</Menu.SubTrigger>
          <Menu.SubContent>Inventory content</Menu.SubContent>
        </Menu.Sub>
      </Menu.Root>,
    )

    const trigger = screen.getByRole('button', { name: 'Inventory' })
    await user.click(trigger)
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('Escape привязан к фокусу внутри своего Sub: не закрывает открытый раздел, если фокус ушёл в другой (закрытый) Sub', async () => {
    const user = userEvent.setup()
    render(
      <Menu.Root>
        <Menu.Sub value="inventory">
          <Menu.SubTrigger>Inventory</Menu.SubTrigger>
          <Menu.SubContent>Inventory content</Menu.SubContent>
        </Menu.Sub>
        <Menu.Sub value="clients">
          <Menu.SubTrigger>Clients</Menu.SubTrigger>
          <Menu.SubContent>Clients content</Menu.SubContent>
        </Menu.Sub>
      </Menu.Root>,
    )

    const inventoryTrigger = screen.getByRole('button', { name: 'Inventory' })
    const clientsTrigger = screen.getByRole('button', { name: 'Clients' })

    await user.click(inventoryTrigger)
    expect(inventoryTrigger).toHaveAttribute('aria-expanded', 'true')

    // Фокус переходит на триггер соседнего, закрытого Sub (например, обычным Tab).
    clientsTrigger.focus()
    await user.keyboard('{Escape}')

    // Escape нажат не "внутри" открытого Inventory — тот остаётся открытым как есть.
    expect(inventoryTrigger).toHaveAttribute('aria-expanded', 'true')
    expect(clientsTrigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('SubTrigger.ref потребителя и внутренний ref (для фокуса по Escape) работают одновременно', async () => {
    const user = userEvent.setup()
    const ref = createRef<HTMLButtonElement>()

    render(
      <Menu.Root>
        <Menu.Sub value="inventory">
          <Menu.SubTrigger ref={ref}>Inventory</Menu.SubTrigger>
          <Menu.SubContent>
            <Menu.Item>Products</Menu.Item>
          </Menu.SubContent>
        </Menu.Sub>
      </Menu.Root>,
    )

    const trigger = screen.getByRole('button', { name: 'Inventory' })
    // Внешний ref потребителя получил тот же DOM-узел, без asChild.
    expect(ref.current).toBe(trigger)

    await user.click(trigger)
    await user.tab()
    await user.keyboard('{Escape}')
    // Возврат фокуса по Escape опирается на внутренний triggerRef — раз он сработал, оба рефа
    // (внешний и внутренний) действительно указывают на один и тот же узел.
    expect(trigger).toHaveFocus()
  })

  it('Escape не трогает уже закрытое подменю', async () => {
    const user = userEvent.setup()
    render(
      <Menu.Root>
        <Menu.Sub value="inventory">
          <Menu.SubTrigger>Inventory</Menu.SubTrigger>
          <Menu.SubContent>Inventory content</Menu.SubContent>
        </Menu.Sub>
      </Menu.Root>,
    )

    const trigger = screen.getByRole('button', { name: 'Inventory' })
    trigger.focus()
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('useMenuSub даёт close/toggle для кастомных элементов (например, кнопки закрытия bottom-sheet)', async () => {
    const user = userEvent.setup()

    function CustomCloseButton() {
      const { close } = useMenuSub()
      return <button onClick={close}>Close sheet</button>
    }

    render(
      <Menu.Root>
        <Menu.Sub value="clients">
          <Menu.SubTrigger>Clients</Menu.SubTrigger>
          <Menu.SubContent>
            <CustomCloseButton />
          </Menu.SubContent>
        </Menu.Sub>
      </Menu.Root>,
    )

    const trigger = screen.getByRole('button', { name: 'Clients' })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByRole('button', { name: 'Close sheet' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('Menu.Item рендерится автономно, без Menu.Root — ему не нужен стейт меню', () => {
    render(<Menu.Item>Standalone</Menu.Item>)
    expect(screen.getByRole('button', { name: 'Standalone' })).toBeInTheDocument()
  })

  it('active-пункт вычисляет потребитель — headless только подсвечивает через data-*/aria-*', () => {
    render(
      <Menu.Root>
        <Menu.Item active>Products</Menu.Item>
      </Menu.Root>,
    )

    const item = screen.getByRole('button', { name: 'Products' })
    expect(item).toHaveAttribute('data-active', '')
    expect(item).toHaveAttribute('aria-current', 'page')
  })

  it('asChild подставляет элемент потребителя (например, <a> вместо <button>) и мержит пропсы/ref', async () => {
    const user = userEvent.setup()
    const onLinkClick = vi.fn()
    const ref = createRef<HTMLAnchorElement>()

    render(
      <Menu.Root>
        <Menu.Item asChild className="text-blue-500" onClick={() => {}}>
          <a href="/products" ref={ref} className="font-medium" onClick={onLinkClick}>
            Products
          </a>
        </Menu.Item>
      </Menu.Root>,
    )

    const link = screen.getByRole('link', { name: 'Products' })
    // asChild не рендерит собственный <button> — итоговый DOM-узел это <a> потребителя.
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/products')
    // classNames смержены, а не заменены друг другом.
    expect(link.className).toContain('text-blue-500')
    expect(link.className).toContain('font-medium')
    expect(ref.current).toBe(link)

    await user.click(link)
    expect(onLinkClick).toHaveBeenCalled()
  })

  it('Menu.Toggle с asChild вызывает и обработчик потребителя, и переключение collapsed', async () => {
    const user = userEvent.setup()
    const onButtonClick = vi.fn()

    render(
      <Menu.Root>
        <Menu.Toggle asChild onClick={() => {}}>
          <button type="button" onClick={onButtonClick}>
            Custom toggle
          </button>
        </Menu.Toggle>
      </Menu.Root>,
    )

    const button = screen.getByRole('button', { name: 'Custom toggle' })
    expect(button).toHaveAttribute('data-state', 'expanded')

    await user.click(button)
    expect(onButtonClick).toHaveBeenCalledTimes(1)
    expect(button).toHaveAttribute('data-state', 'collapsed')
  })

  it('Slot без единственного валидного React-элемента ничего не рендерит и логирует ошибку', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { container } = render(<Slot>не элемент</Slot>)

    expect(container).toBeEmptyDOMElement()
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('asChild ожидает единственный валидный React-элемент'),
    )

    consoleError.mockRestore()
  })

  it('бросает осмысленную ошибку при использовании компонента вне обязательного родителя', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Menu.List>x</Menu.List>)).toThrow(
      /Menu\.List должен рендериться внутри <Menu\.Root>/,
    )
    expect(() => render(<Menu.Toggle>x</Menu.Toggle>)).toThrow(
      /Menu\.Toggle должен рендериться внутри <Menu\.Root>/,
    )
    expect(() => render(<Menu.Sub value="a">x</Menu.Sub>)).toThrow(
      /Menu\.Sub должен рендериться внутри <Menu\.Root>/,
    )
    expect(() => render(<Menu.SubTrigger>x</Menu.SubTrigger>)).toThrow(
      /Menu\.SubTrigger должен рендериться внутри <Menu\.Root>/,
    )
    expect(() =>
      render(
        <Menu.Root>
          <Menu.SubTrigger>x</Menu.SubTrigger>
        </Menu.Root>,
      ),
    ).toThrow(/Menu\.SubTrigger должен рендериться внутри <Menu\.Sub>/)
    expect(() =>
      render(
        <Menu.Root>
          <Menu.SubContent>x</Menu.SubContent>
        </Menu.Root>,
      ),
    ).toThrow(/Menu\.SubContent должен рендериться внутри <Menu\.Sub>/)

    function ComponentUsingMenuSub() {
      useMenuSub()
      return null
    }
    expect(() => render(<ComponentUsingMenuSub />)).toThrow(
      /Menu\.useMenuSub должен рендериться внутри <Menu\.Sub>/,
    )

    consoleError.mockRestore()
  })
})
