import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { MobileNav } from './MobileNav'

function renderMobileNav(initialPath = '/trends') {
  function Harness() {
    const [openValue, setOpenValue] = useState<string | null>(null)
    return <MobileNav openValue={openValue} setOpenValue={setOpenValue} />
  }

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Harness />
    </MemoryRouter>,
  )
}

// И у Clients, и у Inventory bottom-sheet всегда смонтирован (открытость — только через
// data-state), поэтому "×"/backdrop с одинаковым именем есть в DOM сразу у обоих разделов.
// Триггер ссылается на свой sheet через aria-controls — по этому id и скоупим запросы.
function getSheetContent(triggerName: string) {
  const trigger = screen.getByRole('button', { name: triggerName })
  const contentId = trigger.getAttribute('aria-controls')
  const content = contentId ? document.getElementById(contentId) : null
  if (!content) {
    throw new Error(`Не найден sheet-контент для триггера "${triggerName}" (aria-controls)`)
  }
  return within(content)
}

describe('MobileNav', () => {
  it('подсвечивает активный пункт по текущему роуту', () => {
    renderMobileNav('/payments')
    expect(screen.getByRole('link', { name: 'Payments' })).toHaveAttribute('aria-current', 'page')
  })

  it('открывает bottom-sheet по клику на пункт с подменю', async () => {
    const user = userEvent.setup()
    renderMobileNav()

    const trigger = screen.getByRole('button', { name: 'Inventory' })
    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(getSheetContent('Inventory').getByRole('link', { name: 'Products' })).toBeInTheDocument()
  })

  it('кнопка "×" в шапке закрывает bottom-sheet (useMenuSub().close)', async () => {
    const user = userEvent.setup()
    renderMobileNav()

    await user.click(screen.getByRole('button', { name: 'Inventory' }))
    await user.click(getSheetContent('Inventory').getByRole('button', { name: 'Закрыть' }))

    expect(screen.getByRole('button', { name: 'Inventory' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('клик по затемнённому фону тоже закрывает bottom-sheet', async () => {
    const user = userEvent.setup()
    renderMobileNav()

    await user.click(screen.getByRole('button', { name: 'Inventory' }))
    await user.click(getSheetContent('Inventory').getByTestId('sheet-backdrop'))

    expect(screen.getByRole('button', { name: 'Inventory' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('клик по пункту внутри sheet переходит по роуту', async () => {
    const user = userEvent.setup()
    renderMobileNav()

    await user.click(screen.getByRole('button', { name: 'Inventory' }))
    await user.click(getSheetContent('Inventory').getByRole('link', { name: 'Products' }))

    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('aria-current', 'page')
  })

  it('без нарушений accessibility (закрыт)', async () => {
    const { container } = renderMobileNav()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('без нарушений accessibility (открыт bottom-sheet)', async () => {
    const user = userEvent.setup()
    const { container } = renderMobileNav()
    await user.click(screen.getByRole('button', { name: 'Inventory' }))
    expect(await axe(container)).toHaveNoViolations()
  })
})
