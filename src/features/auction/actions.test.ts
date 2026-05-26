import { describe, expect, it, vi } from 'vitest'

import { submitBidWithApproval } from './actions'

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
