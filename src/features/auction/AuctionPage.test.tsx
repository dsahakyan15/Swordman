import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuctionPage } from './AuctionPage'

const mocks = vi.hoisted(() => ({
  auctions: [
    {
      id: 1,
      swordId: 7,
      owner: '0xowner',
      amount: 1,
      highestBid: 120,
      highestBidder: '0xbidder',
      timeEnd: 2000,
      secondsLeft: 900,
      action: 'bid' as const,
    },
  ],
  walletState: { address: '0x1234', status: 'connected' },
  bid: vi.fn(),
  settle: vi.fn(),
  closeAuction: vi.fn(),
  prematureClose: vi.fn(),
}))

vi.mock('./useAuctionListings', () => ({
  useAuctionListings: () => ({
    auctions: mocks.auctions,
    isLoading: false,
    error: '',
  }),
}))

vi.mock('./useAuctionActions', () => ({
  useAuctionActions: () => ({
    pendingAuctionId: null,
    bid: mocks.bid,
    settle: mocks.settle,
    closeAuction: mocks.closeAuction,
    prematureClose: mocks.prematureClose,
  }),
}))

vi.mock('./useCoinMetadata', () => ({
  useCoinMetadata: () => ({ imageUrl: '' }),
}))

vi.mock('../../web3/useWallet', () => ({
  useWallet: () => ({
    walletState: mocks.walletState,
  }),
}))

vi.mock('../../web3/contracts', () => ({
  getReadBankeerContract: vi.fn().mockReturnValue({
    uri: vi.fn().mockResolvedValue('ipfs://QmMeta/{id}.json'),
  }),
}))

vi.mock('../../lib/ipfsHelper', () => ({
  fetchTokenMetadata: vi.fn().mockResolvedValue({
    name: 'Iron Fang',
    imageUrl: '',
    rawUri: 'ipfs://QmMeta/7.json',
  }),
}))

describe('AuctionPage', () => {
  beforeEach(() => {
    mocks.auctions = [
      {
        id: 1,
        swordId: 7,
        owner: '0xowner',
        amount: 1,
        highestBid: 120,
        highestBidder: '0xbidder',
        timeEnd: Math.floor(Date.now() / 1000) + 900,
        secondsLeft: 900,
        action: 'bid',
      },
    ]
    mocks.walletState = { address: '0x1234', status: 'connected' }
    mocks.bid.mockReset()
    mocks.settle.mockReset()
    mocks.closeAuction.mockReset()
    mocks.prematureClose.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the auction grid summary', () => {
    render(<AuctionPage />)

    expect(screen.getByText(/open lots: 1/i)).toBeInTheDocument()
  })

  it('shows cancel auction for the auction creator', () => {
    mocks.walletState = { address: '0xOWNER', status: 'connected' }

    render(<AuctionPage />)

    fireEvent.click(screen.getByRole('button', { name: /cancel auction/i }))

    expect(mocks.closeAuction).toHaveBeenCalledWith(1)
  })

  it('shows premature close for auction creators after a bid exists', () => {
    mocks.walletState = { address: '0xOWNER', status: 'connected' }
    mocks.auctions = [
      {
        id: 1,
        swordId: 7,
        owner: '0xowner',
        amount: 1,
        highestBid: 120,
        highestBidder: '0xbidder',
        timeEnd: Math.floor(Date.now() / 1000) + 900,
        secondsLeft: 900,
        action: 'bid',
      },
    ]

    render(<AuctionPage />)

    fireEvent.click(screen.getByRole('button', { name: /premature close/i }))

    expect(mocks.prematureClose).toHaveBeenCalledWith(1)
  })

  it('opens a bid modal for non-owner users and submits the entered amount', () => {
    render(<AuctionPage />)

    fireEvent.click(screen.getByRole('button', { name: /^bid$/i }))
    fireEvent.change(screen.getByLabelText(/bid amount/i), { target: { value: '130' } })
    fireEvent.click(screen.getByRole('button', { name: /submit bid/i }))

    expect(mocks.bid).toHaveBeenCalledWith(1, 130, '0x1234')
  })

  it('closes the bid modal when clicking outside it', () => {
    render(<AuctionPage />)

    fireEvent.click(screen.getByRole('button', { name: /^bid$/i }))
    fireEvent.click(screen.getByRole('dialog'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the bid modal after a successful bid', async () => {
    mocks.bid.mockResolvedValue(true)

    render(<AuctionPage />)

    fireEvent.click(screen.getByRole('button', { name: /^bid$/i }))
    fireEvent.change(screen.getByLabelText(/bid amount/i), { target: { value: '130' } })
    fireEvent.click(screen.getByRole('button', { name: /submit bid/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('updates auction countdown locally every second', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(1000 * 1000))
    mocks.auctions = [
      {
        id: 1,
        swordId: 7,
        owner: '0xowner',
        amount: 1,
        highestBid: 120,
        highestBidder: '0xbidder',
        timeEnd: 2000,
        secondsLeft: 900,
        action: 'bid',
      },
    ]

    render(<AuctionPage />)

    expect(screen.getByText('00:16:40')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('00:16:39')).toBeInTheDocument()
  })
})
