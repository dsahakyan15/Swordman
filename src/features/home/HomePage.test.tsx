import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HomePage } from './HomePage'

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  navigate: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  }
})

vi.mock('../../web3/useWallet', () => ({
  useWallet: () => ({
    connect: mocks.connect,
  }),
}))

describe('HomePage', () => {
  beforeEach(() => {
    mocks.connect.mockReset()
    mocks.navigate.mockReset()
  })

  it('renders the hero copy, actions, and placeholder slots', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /bankeer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enter game/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
    expect(screen.getAllByLabelText(/featured slot/i)).toHaveLength(3)
  })

  it('navigates to the auction page when entering the game', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /enter game/i }))

    expect(mocks.navigate).toHaveBeenCalledWith('/auction')
  })

  it('connects the wallet from the hero action', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }))

    expect(mocks.connect).toHaveBeenCalledTimes(1)
  })
})
