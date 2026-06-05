import { describe, expect, it, vi } from 'vitest'

import {
  closeAuction,
  createAuctionWithApproval,
  prematureCloseAuction,
  submitBidWithApproval,
} from './actions'

describe('submitBidWithApproval', () => {
  it('approves before bidding when approval is missing', async () => {
    const bankeer = {
      isApprovedForAll: vi.fn().mockResolvedValue(false),
      setApprovalForAll: vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue(undefined) }),
    }

    const auction = {
      buyRequest: vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue(undefined) }),
    }

    await submitBidWithApproval({
      bankeer,
      auction,
      userAddress: '0x1234',
      auctionAddress: '0xabcd',
      auctionId: 3,
      amount: 50,
    })

    expect(bankeer.setApprovalForAll).toHaveBeenCalledWith('0xabcd', true)
    expect(auction.buyRequest).toHaveBeenCalledWith(3, 50)
  })

  it('skips approval when approval already exists', async () => {
    const bankeer = {
      isApprovedForAll: vi.fn().mockResolvedValue(true),
      setApprovalForAll: vi.fn(),
    }

    const auction = {
      buyRequest: vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue(undefined) }),
    }

    await submitBidWithApproval({
      bankeer,
      auction,
      userAddress: '0x1234',
      auctionAddress: '0xabcd',
      auctionId: 3,
      amount: 50,
    })

    expect(bankeer.setApprovalForAll).not.toHaveBeenCalled()
    expect(auction.buyRequest).toHaveBeenCalledWith(3, 50)
  })
})

describe('createAuctionWithApproval', () => {
  it('creates an auction without approval when the auction contract is already approved', async () => {
    const bankeer = {
      isApprovedForAll: vi.fn().mockResolvedValue(true),
      setApprovalForAll: vi.fn(),
    }
    const auction = {
      createAuc: vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue(undefined) }),
    }

    await createAuctionWithApproval({
      bankeer,
      auction,
      userAddress: '0x1234',
      auctionAddress: '0xabcd',
      duration: 3600,
      swordId: 3,
      amount: 1,
      startingBid: 50,
    })

    expect(bankeer.setApprovalForAll).not.toHaveBeenCalled()
    expect(auction.createAuc).toHaveBeenCalledWith(3600, 3, 1, 50)
  })

  it('approves before creating an auction when approval is missing', async () => {
    const approvalWait = vi.fn().mockResolvedValue(undefined)
    const createWait = vi.fn().mockResolvedValue(undefined)
    const bankeer = {
      isApprovedForAll: vi.fn().mockResolvedValue(false),
      setApprovalForAll: vi.fn().mockResolvedValue({ wait: approvalWait }),
    }
    const auction = {
      createAuc: vi.fn().mockResolvedValue({ wait: createWait }),
    }

    await createAuctionWithApproval({
      bankeer,
      auction,
      userAddress: '0x1234',
      auctionAddress: '0xabcd',
      duration: 3600,
      swordId: 3,
      amount: 1,
      startingBid: 50,
    })

    expect(bankeer.setApprovalForAll).toHaveBeenCalledWith('0xabcd', true)
    expect(approvalWait).toHaveBeenCalledTimes(1)
    expect(auction.createAuc).toHaveBeenCalledWith(3600, 3, 1, 50)
    expect(createWait).toHaveBeenCalledTimes(1)
  })
})

describe('closeAuction', () => {
  it('closes an auction through cancelAuc', async () => {
    const wait = vi.fn().mockResolvedValue(undefined)
    const auction = {
      cancelAuc: vi.fn().mockResolvedValue({ wait }),
    }

    await closeAuction({ auction, auctionId: 5 })

    expect(auction.cancelAuc).toHaveBeenCalledWith(5)
    expect(wait).toHaveBeenCalledTimes(1)
  })
})

describe('prematureCloseAuction', () => {
  it('prematurely closes an auction through prematureClose', async () => {
    const wait = vi.fn().mockResolvedValue(undefined)
    const auction = {
      prematureClose: vi.fn().mockResolvedValue({ wait }),
    }

    await prematureCloseAuction({ auction, auctionId: 5 })

    expect(auction.prematureClose).toHaveBeenCalledWith(5)
    expect(wait).toHaveBeenCalledTimes(1)
  })
})
