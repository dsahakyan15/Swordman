import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import { AppRoutes } from './AppRoutes'

vi.mock('../features/home/HomePage', () => ({
  HomePage: () => <h1>BANKEER</h1>,
}))

vi.mock('../features/auction/AuctionPage', () => ({
  AuctionPage: () => <h1>Auction House</h1>,
}))

describe('AppRoutes', () => {
  it('renders the home page at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    const shell = screen.getByTestId('app-shell')
    const heading = screen.getByRole('heading', { level: 1, name: 'BANKEER' })

    expect(shell).toContainElement(heading)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the auction page at /auction', () => {
    render(
      <MemoryRouter initialEntries={['/auction']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    const shell = screen.getByTestId('app-shell')
    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Auction House',
    })

    expect(shell).toContainElement(heading)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
