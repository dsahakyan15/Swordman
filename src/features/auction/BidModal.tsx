import { type FormEvent, type MouseEvent, useState } from 'react'

import { PixelButton } from '../../components/pixel/PixelButton'
import { PixelLoader } from '../../components/pixel/PixelLoader'
import { formatCompactNumber } from '../../lib/format'
import type { AuctionViewModel } from './types'

type BidModalProps = {
  auction: AuctionViewModel | null
  itemName: string
  isOpen: boolean
  isPending: boolean
  onClose: () => void
  onSubmit: (amount: number) => boolean | Promise<boolean>
}

export function BidModal({
  auction,
  itemName,
  isOpen,
  isPending,
  onClose,
  onSubmit,
}: BidModalProps) {
  if (!isOpen || !auction) {
    return null
  }

  return (
    <BidModalContent
      key={auction.id}
      auction={auction}
      itemName={itemName}
      isPending={isPending}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}

function BidModalContent({
  auction,
  itemName,
  isPending,
  onClose,
  onSubmit,
}: Omit<BidModalProps, 'auction' | 'isOpen'> & { auction: AuctionViewModel }) {
  const [error, setError] = useState('')
  const activeAuction = auction

  async function submitBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextAmount = Number(formData.get('amount'))

    if (!Number.isFinite(nextAmount) || nextAmount <= activeAuction.highestBid) {
      setError(`Bid must be greater than ${formatCompactNumber(activeAuction.highestBid)} COIN.`)
      return
    }

    setError('')
    const isSuccessful = await onSubmit(nextAmount)
    if (isSuccessful) {
      onClose()
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid items-start justify-items-center overflow-y-auto bg-black/70 px-3 py-4 backdrop-blur-sm sm:place-items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bid-modal-title"
      onClick={handleBackdropClick}
    >
      <form
        className="grid max-h-[calc(100vh-2rem)] w-full max-w-md gap-4 overflow-y-auto rounded-none border-2 border-purple-300/80 bg-slate-950 p-4 text-white shadow-[0_0_0_4px_rgba(15,23,42,0.95),0_0_34px_rgba(168,85,247,0.28)] [image-rendering:pixelated] sm:p-5"
        onSubmit={submitBid}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-purple-100">Place Bid</p>
            <h2
              id="bid-modal-title"
              className="truncate text-2xl uppercase tracking-[0.16em] text-white"
            >
              {itemName}
            </h2>
            <p className="font-sans text-sm text-orange-100">
              Current: {formatCompactNumber(activeAuction.highestBid)} COIN
            </p>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-none border border-pink-300/80 bg-black/50 text-pink-100"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close bid modal"
          >
            X
          </button>
        </div>

        <label className="grid gap-1 text-xs uppercase tracking-[0.16em] text-purple-100">
          Bid amount
          <input
            className="min-h-10 rounded-none border border-indigo-300/50 bg-black/70 px-3 font-sans text-sm text-white outline-none focus:border-amber-200"
            min={activeAuction.highestBid + 1}
            name="amount"
            type="number"
            defaultValue={activeAuction.highestBid + 1}
            required
          />
        </label>

        {error ? (
          <p className="border border-pink-400/60 bg-pink-950/50 p-3 text-sm text-pink-100">
            {error}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <PixelButton type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </PixelButton>
          <PixelButton variant="primary" disabled={isPending}>
            {isPending ? <PixelLoader /> : 'Submit Bid'}
          </PixelButton>
        </div>
      </form>
    </div>
  )
}
