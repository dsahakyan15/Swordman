import { useState } from 'react'

import { PixelButton } from '../../components/pixel/PixelButton'
import { formatCompactNumber, shortenAddress } from '../../lib/format'
import { useWallet } from '../../web3/useWallet'
import { CreateAuctionModal } from './CreateAuctionModal'
import type { CreateAuctionValues } from './InventorySlot'
import { InventoryGrid } from './InventoryGrid'
import { useCreateAuction } from './useCreateAuction'
import { usePortfolioInventory, type PortfolioInventoryItem } from './usePortfolioInventory'

export function PortfolioPage() {
  const { walletState, connect } = useWallet()
  const inventory = usePortfolioInventory(walletState.address)
  const { pendingItemId, createAuction } = useCreateAuction(inventory.refresh)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [auctionItem, setAuctionItem] = useState<PortfolioInventoryItem | null>(null)

  function handleCreateAuction(values: CreateAuctionValues) {
    void createAuction({
      ...values,
      userAddress: walletState.address,
    })
  }

  function handleSelectItem(item: PortfolioInventoryItem) {
    setSelectedItemId((current) => (current === item.id ? null : item.id))
  }

  if (walletState.status !== 'connected') {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl items-center justify-center px-4 py-12 text-center">
        <div className="grid gap-4 rounded-none border border-indigo-400/40 bg-slate-950/65 p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.26em] text-orange-100">Player Vault</p>
          <h1 className="text-3xl uppercase tracking-[0.18em] text-white md:text-5xl">
            Portfolio
          </h1>
          <p className="text-sm leading-6 text-slate-200">
            Connect your wallet to view your Bankeer COIN balance and RPG inventory.
          </p>
          <PixelButton variant="primary" onClick={() => void connect()}>
            Connect Wallet
          </PixelButton>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex flex-col gap-4 rounded-none border border-indigo-400/40 bg-slate-950/60 p-4 text-white shadow-[0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-orange-100">Player Vault</p>
          <h1 className="text-3xl uppercase tracking-[0.18em] text-white md:text-5xl">
            Portfolio
          </h1>
          <p className="text-sm text-purple-100">{shortenAddress(walletState.address)}</p>
        </div>
        <div className="flex items-center gap-3 rounded-none border border-orange-400/40 bg-black/40 px-4 py-3 text-sm uppercase tracking-[0.16em]">
          {inventory.coinMetadata?.imageUrl ? (
            <img
              src={inventory.coinMetadata.imageUrl}
              alt=""
              className="h-6 [image-rendering:pixelated]"
            />
          ) : (
            <span className="h-6 w-6 border border-orange-300/70 bg-orange-300/30 [image-rendering:pixelated]" />
          )}
          <span title={`${inventory.coinBalance.toString()} COIN`}>
            <span className="font-sans">{formatCompactNumber(inventory.coinBalance)}</span> COIN
          </span>
        </div>
      </div>

      {inventory.error ? (
        <p className="rounded-none border border-pink-400/40 bg-pink-950/50 p-3 text-sm text-pink-100 backdrop-blur-sm">
          {inventory.error}
        </p>
      ) : null}

      <InventoryGrid
        isLoading={inventory.isLoading}
        items={inventory.items}
        pendingItemId={pendingItemId}
        selectedItemId={selectedItemId}
        onSelectItem={handleSelectItem}
        onOpenCreateAuction={(item) => setAuctionItem(item)}
      />

      <CreateAuctionModal
        item={auctionItem}
        isOpen={auctionItem !== null}
        isPending={pendingItemId === auctionItem?.id}
        onClose={() => setAuctionItem(null)}
        onSubmit={handleCreateAuction}
      />
    </section>
  )
}
