import type { AuctionViewModel, RawAuction } from './types'

export function toAuctionViewModel(
  raw: RawAuction,
  nowSeconds: number,
): AuctionViewModel | null {
  if (raw.state !== 0) {
    return null
  }

  const secondsLeft = Math.max(0, raw.timeEnd - nowSeconds)

  return {
    id: raw.id,
    swordId: raw.swordId,
    owner: raw.owner,
    amount: raw.amount,
    highestBid: raw.highestBid,
    highestBidder: raw.highestBidder,
    timeEnd: raw.timeEnd,
    secondsLeft,
    action: raw.timeEnd <= nowSeconds ? 'settle' : 'bid',
  }
}
