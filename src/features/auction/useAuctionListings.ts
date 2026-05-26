import { useEffect, useState } from 'react'

import { getReadAuctionContract } from '../../web3/contracts'
import { toAuctionViewModel } from './model'
import type { AuctionViewModel, RawAuction } from './types'

type AuctionListingsState = {
  auctions: AuctionViewModel[]
  isLoading: boolean
  error: string
}

const emptyState: AuctionListingsState = {
  auctions: [],
  isLoading: true,
  error: '',
}

export function useAuctionListings(refreshKey = 0) {
  const [state, setState] = useState<AuctionListingsState>(emptyState)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        setState((current) => ({ ...current, isLoading: true, error: '' }))
        const contract = getReadAuctionContract()
        const nextAuctionId = Number(await contract.nextAuctionId())
        const nowSeconds = Math.floor(Date.now() / 1000)

        const rawAuctions = (await Promise.all(
          Array.from({ length: nextAuctionId }, async (_, id) => {
            const entry = await contract.AuctionList(id)

            return {
              id,
              owner: entry.owner,
              swordId: Number(entry.SWORD_ID),
              timeEnd: Number(entry.timeEnd),
              amount: Number(entry.amount),
              highestBid: Number(entry.highestBid),
              highestBidder: entry.highestBidder,
              state: Number(entry.state),
            } satisfies RawAuction
          }),
        )) as RawAuction[]

        const auctions = rawAuctions
          .map((raw) => toAuctionViewModel(raw, nowSeconds))
          .filter((item): item is AuctionViewModel => item !== null)

        if (isMounted) {
          setState({
            auctions,
            isLoading: false,
            error: '',
          })
        }
      } catch (error) {
        if (isMounted) {
          setState({
            auctions: [],
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load auctions',
          })
        }
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  return state
}
