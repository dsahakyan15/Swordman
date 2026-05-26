import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { AppRoutes } from './AppRoutes'

describe('AppRoutes', () => {
  it('renders the home page at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'BANKEER' }),
    ).toBeInTheDocument()
  })

  it('renders the auction page at /auction', () => {
    render(
      <MemoryRouter initialEntries={['/auction']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Auction House' }),
    ).toBeInTheDocument()
  })
})
