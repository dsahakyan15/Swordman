import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AuctionPage } from './AuctionPage'

vi.mock('./useAuctionListings', () => ({
  useAuctionListings: () => ({
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
        action: 'bid',
      },
    ],
    isLoading: false,
    error: '',
  }),
}))

vi.mock('./useAuctionActions', () => ({
  useAuctionActions: () => ({
    pendingAuctionId: null,
    bid: vi.fn(),
    settle: vi.fn(),
  }),
}))

vi.mock('./useCoinMetadata', () => ({
  useCoinMetadata: () => ({ imageUrl: '' }),
}))

vi.mock('../../web3/useWallet', () => ({
  useWallet: () => ({
    walletState: { address: '0x1234', status: 'connected' },
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
  it('renders the auction grid summary', () => {
    render(<AuctionPage />)

    expect(screen.getByText(/open lots: 1/i)).toBeInTheDocument()
  })
})
