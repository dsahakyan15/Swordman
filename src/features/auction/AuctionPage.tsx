import { useEffect, useState } from 'react'

import { fetchTokenMetadata } from '../../lib/ipfsHelper'
import { getReadBankeerContract } from '../../web3/contracts'
import { useWallet } from '../../web3/useWallet'
import { AuctionCard } from './AuctionCard'
import { useAuctionActions } from './useAuctionActions'
import { useAuctionListings } from './useAuctionListings'
import { useCoinMetadata } from './useCoinMetadata'

export function AuctionPage() {
  const { walletState } = useWallet()
  const [refreshKey, setRefreshKey] = useState(0)
  const { auctions, isLoading, error } = useAuctionListings(refreshKey)
  const { pendingAuctionId, bid, settle } = useAuctionActions(() =>
    setRefreshKey((value) => value + 1),
  )
  const coinMeta = useCoinMetadata()
  const [metaById, setMetaById] = useState<Record<number, { name: string; imageUrl: string }>>({})

  useEffect(() => {
    let isMounted = true

    async function loadItemMetadata() {
      const contract = getReadBankeerContract()
      const entries = await Promise.all(
        auctions.map(async (auction) => {
          const uri = await contract.uri(auction.swordId)
          const metadata = await fetchTokenMetadata(uri, auction.swordId)

          return [auction.swordId, { name: metadata.name, imageUrl: metadata.imageUrl }] as const
        }),
      )

      if (isMounted) {
        setMetaById(Object.fromEntries(entries))
      }
    }

    if (auctions.length > 0) {
      void loadItemMetadata()
    } else {
      setMetaById({})
    }

    return () => {
      isMounted = false
    }
  }, [auctions])

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3 text-white">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl uppercase tracking-[0.18em] text-white md:text-4xl">
            Auction House
          </h1>
          <p className="text-sm text-slate-200">
            Live listings from localhost Hardhat with ERC-1155 metadata over IPFS.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-none border border-indigo-400/40 bg-slate-950/60 px-4 py-3 backdrop-blur-sm">
            Open lots: {auctions.length}
          </div>
          <div className="rounded-none border border-orange-400/40 bg-slate-950/60 px-4 py-3 backdrop-blur-sm">
            {walletState.address ? walletState.address : 'Wallet disconnected'}
          </div>
        </div>
      </div>

      {isLoading ? <p>Loading auctions...</p> : null}
      {error ? <p>{error}</p> : null}
      {!isLoading && !error && auctions.length === 0 ? <p>No open auctions.</p> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {auctions.map((auction) => {
          const itemMeta = metaById[auction.swordId]

          return (
            <AuctionCard
              key={auction.id}
              auction={auction}
              itemName={itemMeta?.name ?? `Item #${auction.swordId}`}
              itemImageUrl={itemMeta?.imageUrl ?? ''}
              coinImageUrl={coinMeta?.imageUrl ?? ''}
              isPending={pendingAuctionId === auction.id}
              onBid={() => void bid(auction.id, auction.highestBid + 1, walletState.address)}
              onSettle={() => void settle(auction.id)}
            />
          )
        })}
      </div>
    </section>
  )
}
