import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PortfolioPage } from './PortfolioPage'

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  createAuction: vi.fn(),
  walletState: { address: '', status: 'disconnected' },
  inventoryItems: [] as Array<{
    id: number
    balance: bigint
    price: bigint
    metadata: { name: string; imageUrl: string; rawUri: string }
  }>,
  coinBalance: 0n,
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
    coinBalance: mocks.coinBalance,
    coinMetadata: null,
    items: mocks.inventoryItems,
    refresh: vi.fn(),
  }),
}))

vi.mock('./useCreateAuction', () => ({
  useCreateAuction: () => ({
    pendingItemId: null,
    createAuction: mocks.createAuction,
  }),
}))

function toDatetimeLocal(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

describe('PortfolioPage', () => {
  beforeEach(() => {
    mocks.connect.mockReset()
    mocks.createAuction.mockReset()
    mocks.walletState = { address: '', status: 'disconnected' }
    mocks.inventoryItems = []
    mocks.coinBalance = 0n
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a connect wallet state when disconnected', () => {
    render(<PortfolioPage />)

    fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }))

    expect(mocks.connect).toHaveBeenCalledTimes(1)
  })

  it('formats the portfolio coin balance like item prices', () => {
    mocks.walletState = { address: '0x1234', status: 'connected' }
    mocks.coinBalance = 1200n

    render(<PortfolioPage />)

    expect(screen.getByTitle('1200 COIN')).toHaveTextContent('1.2K COIN')
  })

  it('opens the contextual create auction menu and submits the modal', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-05T10:00:00'))
    mocks.walletState = { address: '0x1234', status: 'connected' }
    mocks.inventoryItems = [
      {
        id: 3,
        balance: 2n,
        price: 25n,
        metadata: { name: 'Iron Fang', imageUrl: '', rawUri: 'ipfs://item' },
      },
    ]

    render(<PortfolioPage />)

    fireEvent.click(screen.getByRole('button', { name: /select iron fang/i }))
    fireEvent.click(screen.getByRole('button', { name: /create auction/i }))
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/starting bid/i), { target: { value: '25' } })
    fireEvent.change(screen.getByLabelText(/ends at/i), {
      target: { value: toDatetimeLocal(new Date('2026-06-05T11:00:00')) },
    })
    fireEvent.click(screen.getByRole('button', { name: /submit auction/i }))

    expect(mocks.createAuction).toHaveBeenCalledWith({
      itemId: 3,
      amount: 1,
      startingBid: 25,
      duration: 3600,
      userAddress: '0x1234',
    })
  })

  it('closes the create auction modal when clicking outside it', () => {
    mocks.walletState = { address: '0x1234', status: 'connected' }
    mocks.inventoryItems = [
      {
        id: 3,
        balance: 2n,
        price: 25n,
        metadata: { name: 'Iron Fang', imageUrl: '', rawUri: 'ipfs://item' },
      },
    ]

    render(<PortfolioPage />)

    fireEvent.click(screen.getByRole('button', { name: /select iron fang/i }))
    fireEvent.click(screen.getByRole('button', { name: /create auction/i }))
    fireEvent.click(screen.getByRole('dialog', { name: /iron fang/i }))

    expect(screen.queryByRole('dialog', { name: /iron fang/i })).not.toBeInTheDocument()
  })

  it('marks the auction end date input with visible calendar styling', () => {
    mocks.walletState = { address: '0x1234', status: 'connected' }
    mocks.inventoryItems = [
      {
        id: 3,
        balance: 2n,
        price: 25n,
        metadata: { name: 'Iron Fang', imageUrl: '', rawUri: 'ipfs://item' },
      },
    ]

    render(<PortfolioPage />)

    fireEvent.click(screen.getByRole('button', { name: /select iron fang/i }))
    fireEvent.click(screen.getByRole('button', { name: /create auction/i }))

    expect(screen.getByLabelText(/ends at/i)).toHaveClass('auction-datetime-input')
  })

  it('keeps the selected inventory card in a single card-sized grid cell', () => {
    mocks.walletState = { address: '0x1234', status: 'connected' }
    mocks.inventoryItems = [
      {
        id: 3,
        balance: 2n,
        price: 25n,
        metadata: { name: 'Iron Fang', imageUrl: '', rawUri: 'ipfs://item' },
      },
    ]

    render(<PortfolioPage />)

    const itemButton = screen.getByRole('button', { name: /select iron fang/i })
    fireEvent.click(itemButton)

    expect(itemButton.parentElement).not.toHaveClass(
      'md:grid-cols-[minmax(0,1fr)_minmax(170px,0.55fr)]',
    )
    expect(screen.getByRole('button', { name: /create auction/i })).toBeInTheDocument()
  })

  it('prevents starting bids below half the selected item price per unit', () => {
    mocks.walletState = { address: '0x1234', status: 'connected' }
    mocks.inventoryItems = [
      {
        id: 3,
        balance: 2n,
        price: 25n,
        metadata: { name: 'Iron Fang', imageUrl: '', rawUri: 'ipfs://item' },
      },
    ]

    render(<PortfolioPage />)

    fireEvent.click(screen.getByRole('button', { name: /select iron fang/i }))
    fireEvent.click(screen.getByRole('button', { name: /create auction/i }))
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText(/starting bid/i), { target: { value: '24' } })
    fireEvent.click(screen.getByRole('button', { name: /submit auction/i }))

    expect(screen.getByText(/minimum starting bid is 25 coin/i)).toBeInTheDocument()
    expect(mocks.createAuction).not.toHaveBeenCalled()
  })
})
