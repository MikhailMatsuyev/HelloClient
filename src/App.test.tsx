import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Smoke-тест: проверяет, что тестовый раннер (Vitest + RTL + jsdom) настроен корректно.
describe('App', () => {
  it('renders the placeholder heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /headless sidebar menu/i })).toBeInTheDocument()
  })
})
