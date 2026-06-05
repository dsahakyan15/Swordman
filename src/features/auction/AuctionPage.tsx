import { useEffect, useState } from 'react'

import { fetchTokenMetadata } from '../../lib/ipfsHelper'
import { getReadBankeerContract } from '../../web3/contracts'
import { useWallet } from '../../web3/useWallet'
import { AuctionCard } from './AuctionCard'
import { BidModal } from './BidModal'
import { useAuctionActions } from './useAuctionActions'
import { useAuctionListings } from './useAuctionListings'
import { useCoinMetadata } from './useCoinMetadata'
import type { AuctionViewModel } from './types'

function hasBidder(highestBidder: string) {
  const addressBody = highestBidder.replace(/^0x/i, '')
  return addressBody.length > 0 && /[1-9a-f]/i.test(addressBody)
}

export function AuctionPage() {
  const { walletState } = useWallet()
  const [refreshKey, setRefreshKey] = useState(0)
  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000))
  const [bidAuction, setBidAuction] = useState<AuctionViewModel | null>(null)
  const { auctions, isLoading, error } = useAuctionListings(refreshKey)
  const { pendingAuctionId, bid, settle, closeAuction, prematureClose } = useAuctionActions(() =>
    setRefreshKey((value) => value + 1),
  )
  const coinMeta = useCoinMetadata()
  const [metaById, setMetaById] = useState<Record<number, { name: string; imageUrl: string }>>({})

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowSeconds(Math.floor(Date.now() / 1000))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

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
    }

    return () => {
      isMounted = false
    }
  }, [auctions])

  const liveAuctions = auctions.map((auction) => ({
    ...auction,
    secondsLeft: Math.max(0, auction.timeEnd - nowSeconds),
    action: auction.timeEnd <= nowSeconds ? ('settle' as const) : ('bid' as const),
  }))

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
            Open lots: {liveAuctions.length}
          </div>
          <div className="rounded-none border border-orange-400/40 bg-slate-950/60 px-4 py-3 backdrop-blur-sm">
            {walletState.address ? walletState.address : 'Wallet disconnected'}
          </div>
        </div>
      </div>

      {isLoading ? <p>Loading auctions...</p> : null}
      {error ? <p>{error}</p> : null}
      {!isLoading && !error && liveAuctions.length === 0 ? <p>No open auctions.</p> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {liveAuctions.map((auction) => {
          const itemMeta = metaById[auction.swordId]
          const isOwner =
            Boolean(walletState.address) &&
            walletState.address.toLowerCase() === auction.owner.toLowerCase()
          const isExpired = auction.action === 'settle'
          const shouldShowPrematureClose = isOwner && !isExpired && hasBidder(auction.highestBidder)
          const primaryActionLabel = isExpired ? 'Settle' : isOwner ? 'Cancel Auction' : 'Bid'
          const primaryActionVariant = isExpired ? 'primary' : isOwner ? 'danger' : 'secondary'
          const handlePrimaryAction = () => {
            if (isExpired) {
              void settle(auction.id)
              return
            }

            if (isOwner) {
              void closeAuction(auction.id)
              return
            }

            setBidAuction(auction)
          }

          return (
            <AuctionCard
              key={auction.id}
              auction={auction}
              itemName={itemMeta?.name ?? `Item #${auction.swordId}`}
              itemImageUrl={itemMeta?.imageUrl ?? ''}
              coinImageUrl={coinMeta?.imageUrl ?? ''}
              isPending={pendingAuctionId === auction.id}
              primaryActionLabel={primaryActionLabel}
              primaryActionVariant={primaryActionVariant}
              secondaryActionLabel={shouldShowPrematureClose ? 'Premature Close' : undefined}
              secondaryActionVariant="primary"
              onPrimaryAction={handlePrimaryAction}
              onSecondaryAction={() => void prematureClose(auction.id)}
              onBid={() => setBidAuction(auction)}
              onSettle={() => void settle(auction.id)}
            />
          )
        })}
      </div>

      <BidModal
        auction={bidAuction}
        itemName={bidAuction ? metaById[bidAuction.swordId]?.name ?? `Item #${bidAuction.swordId}` : ''}
        isOpen={bidAuction !== null}
        isPending={pendingAuctionId === bidAuction?.id}
        onClose={() => setBidAuction(null)}
        onSubmit={async (amount) => {
          if (!bidAuction || !walletState.address) {
            return false
          }

          const isSuccessful = await bid(bidAuction.id, amount, walletState.address)
          if (isSuccessful) {
            setBidAuction(null)
          }
          return isSuccessful
        }}
      />
    </section>
  )
}
