export type RawAuction = {
  id: number
  owner: string
  swordId: number
  timeEnd: number
  amount: number
  highestBid: number
  highestBidder: string
  state: number
}

export type AuctionViewModel = {
  id: number
  swordId: number
  owner: string
  amount: number
  highestBid: number
  highestBidder: string
  timeEnd: number
  secondsLeft: number
  action: 'bid' | 'settle'
}
