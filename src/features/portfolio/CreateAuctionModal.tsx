import { type FormEvent, type MouseEvent, useState } from 'react'

import { PixelButton } from '../../components/pixel/PixelButton'
import { PixelLoader } from '../../components/pixel/PixelLoader'
import { formatCompactNumber } from '../../lib/format'
import type { CreateAuctionValues } from './InventorySlot'
import type { PortfolioInventoryItem } from './usePortfolioInventory'

const oneYearSeconds = 365 * 24 * 60 * 60

type CreateAuctionModalProps = {
  item: PortfolioInventoryItem | null
  isOpen: boolean
  isPending: boolean
  onClose: () => void
  onSubmit: (values: CreateAuctionValues) => void
}

function toDatetimeLocalInput(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

export function CreateAuctionModal({
  item,
  isOpen,
  isPending,
  onClose,
  onSubmit,
}: CreateAuctionModalProps) {
  if (!isOpen || !item) {
    return null
  }

  return (
    <CreateAuctionModalContent
      key={item.id}
      item={item}
      isPending={isPending}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}

function CreateAuctionModalContent({
  item: activeItem,
  isPending,
  onClose,
  onSubmit,
}: Omit<CreateAuctionModalProps, 'item' | 'isOpen'> & { item: PortfolioInventoryItem }) {
  const [dateBounds] = useState(() => {
    const now = new Date()

    return {
      minEndsAt: toDatetimeLocalInput(now),
      maxEndsAt: toDatetimeLocalInput(new Date(now.getTime() + oneYearSeconds * 1000)),
    }
  })
  const [amount, setAmount] = useState('1')
  const [startingBid, setStartingBid] = useState(() =>
    Math.ceil(Number(activeItem.price) / 2).toString(),
  )
  const [endsAt, setEndsAt] = useState(() =>
    toDatetimeLocalInput(new Date(Date.now() + 60 * 60 * 1000)),
  )
  const [error, setError] = useState('')
  const parsedAmount = Number(amount)
  const minimumStartingBid = Math.ceil((Number(activeItem.price) * (parsedAmount || 1)) / 2)

  function submitAuction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextAmount = Number(amount)
    const nextStartingBid = Number(startingBid)
    const endsAtMs = new Date(endsAt).getTime()
    const duration = Math.floor((endsAtMs - Date.now()) / 1000)
    const nextMinimumStartingBid = Math.ceil((Number(activeItem.price) * nextAmount) / 2)

    if (!Number.isInteger(nextAmount) || nextAmount < 1 || nextAmount > Number(activeItem.balance)) {
      setError(`Amount must be between 1 and ${activeItem.balance.toString()}.`)
      return
    }

    if (!Number.isFinite(endsAtMs) || duration < 1 || duration > oneYearSeconds) {
      setError('Auction end time must be within 1 year.')
      return
    }

    if (!Number.isFinite(nextStartingBid) || nextStartingBid < nextMinimumStartingBid) {
      setError(`Minimum starting bid is ${formatCompactNumber(nextMinimumStartingBid)} COIN.`)
      return
    }

    setError('')
    onSubmit({
      itemId: activeItem.id,
      amount: nextAmount,
      startingBid: nextStartingBid,
      duration,
    })
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
      aria-labelledby="create-auction-title"
      onClick={handleBackdropClick}
    >
      <form
        className="grid max-h-[calc(100vh-2rem)] w-full max-w-lg gap-4 overflow-y-auto rounded-none border-2 border-amber-300/80 bg-slate-950 p-4 text-white shadow-[0_0_0_4px_rgba(15,23,42,0.95),0_0_34px_rgba(251,191,36,0.3)] [image-rendering:pixelated] sm:p-5"
        onSubmit={submitAuction}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-orange-100">
              Create Auction
            </p>
            <h2
              id="create-auction-title"
              className="truncate text-2xl uppercase tracking-[0.16em] text-white"
            >
              {activeItem.metadata.name}
            </h2>
            <p className="font-sans text-sm text-orange-100" title={`${activeItem.price.toString()} COIN`}>
              Price: {formatCompactNumber(activeItem.price)} COIN
            </p>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-none border border-pink-300/80 bg-black/50 text-pink-100"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close create auction modal"
          >
            X
          </button>
        </div>

        <label className="grid gap-1 text-xs uppercase tracking-[0.16em] text-purple-100">
          Amount
          <input
            className="min-h-10 rounded-none border border-indigo-300/50 bg-black/70 px-3 font-sans text-sm text-white outline-none focus:border-amber-200"
            min="1"
            max={activeItem.balance.toString()}
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </label>

        <label className="grid gap-1 text-xs uppercase tracking-[0.16em] text-purple-100">
          Starting bid
          <input
            className="min-h-10 rounded-none border border-indigo-300/50 bg-black/70 px-3 font-sans text-sm text-white outline-none focus:border-amber-200"
            min={minimumStartingBid}
            type="number"
            value={startingBid}
            onChange={(event) => setStartingBid(event.target.value)}
            required
          />
        </label>

        <label className="grid gap-1 text-xs uppercase tracking-[0.16em] text-purple-100">
          Ends at
          <input
            className="auction-datetime-input min-h-10 rounded-none border border-indigo-300/50 bg-black/70 px-3 font-sans text-sm text-white outline-none [color-scheme:dark] focus:border-amber-200"
            min={dateBounds.minEndsAt}
            max={dateBounds.maxEndsAt}
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            required
          />
        </label>

        <p className="font-sans text-sm text-orange-100">
          Minimum starting bid is {formatCompactNumber(minimumStartingBid)} COIN.
        </p>

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
            {isPending ? <PixelLoader /> : 'Submit Auction'}
          </PixelButton>
        </div>
      </form>
    </div>
  )
}
