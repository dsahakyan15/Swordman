import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PortfolioPage } from './PortfolioPage'

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  walletState: { address: '', status: 'disconnected' },
}))

vi.mock('../../web3/useWallet', () => ({
  useWallet: () => ({
    walletState: mocks.walletState,
    connect: mocks.connect,
  }),
}))

vi.mock('./usePortfolioInventory', () => ({
  usePortfolioInventory: () => ({
    isLoading: false,
    error: '',
    coinBalance: 0n,
    coinMetadata: null,
    items: [],
  }),
}))

describe('PortfolioPage', () => {
  beforeEach(() => {
    mocks.connect.mockReset()
    mocks.walletState = { address: '', status: 'disconnected' }
  })

  it('shows a connect wallet state when disconnected', () => {
    render(<PortfolioPage />)

    fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }))

    expect(mocks.connect).toHaveBeenCalledTimes(1)
  })
})
