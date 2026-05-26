import { describe, expect, it } from 'vitest'

import { toAuctionViewModel } from './model'

describe('toAuctionViewModel', () => {
  it('keeps open auctions in bid mode before expiry', () => {
    const result = toAuctionViewModel(
      {
        id: 0,
        owner: '0xowner',
        swordId: 7,
        timeEnd: 2000,
        amount: 1,
        highestBid: 120,
        highestBidder: '0xbidder',
        state: 0,
      },
      1000,
    )

    expect(result?.action).toBe('bid')
  })

  it('turns expired open auctions into settle mode', () => {
    const result = toAuctionViewModel(
      {
        id: 1,
        owner: '0xowner',
        swordId: 9,
        timeEnd: 1000,
        amount: 1,
        highestBid: 175,
        highestBidder: '0xbidder',
        state: 0,
      },
      1001,
    )

    expect(result?.action).toBe('settle')
  })

  it('returns null for non-open auctions', () => {
    const result = toAuctionViewModel(
      {
        id: 2,
        owner: '0xowner',
        swordId: 10,
        timeEnd: 1000,
        amount: 1,
        highestBid: 90,
        highestBidder: '0xbidder',
        state: 1,
      },
      1001,
    )

    expect(result).toBeNull()
  })
})
