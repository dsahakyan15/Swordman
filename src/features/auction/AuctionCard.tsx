import { PixelButton } from '../../components/pixel/PixelButton'
import { PixelLoader } from '../../components/pixel/PixelLoader'
import { formatCountdown } from '../../lib/format'
import type { AuctionViewModel } from './types'

type AuctionCardProps = {
  auction: AuctionViewModel
  itemName: string
  itemImageUrl: string
  coinImageUrl: string
  isPending: boolean
  onBid: () => void
  onSettle: () => void
}

export function AuctionCard({
  auction,
  itemName,
  itemImageUrl,
  coinImageUrl,
  isPending,
  onBid,
  onSettle,
}: AuctionCardProps) {
  return (
    <article className="grid gap-3 rounded-none border border-indigo-500/50 bg-black/60 p-4 text-white backdrop-blur-sm">
      <div className="mx-auto aspect-square w-32 overflow-hidden rounded-none border border-pink-400/30 bg-slate-950/70 [image-rendering:pixelated]">
        {itemImageUrl ? (
          <img
            src={itemImageUrl}
            alt={itemName}
            className="h-full w-full object-cover [image-rendering:pixelated]"
          />
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-purple-100">
        <span>{itemName}</span>
        <span>{formatCountdown(auction.secondsLeft)}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm text-orange-100">
        <span className="inline-flex items-center gap-2">
          {coinImageUrl ? (
            <img src={coinImageUrl} alt="" className="h-4 w-4 [image-rendering:pixelated]" />
          ) : (
            <span className="h-4 w-4 bg-orange-300" />
          )}
          {auction.highestBid} COIN
        </span>
        <span className="text-[11px] uppercase tracking-[0.16em] text-slate-200">
          {auction.action === 'settle' ? 'Settle' : 'Bid'}
        </span>
      </div>
      <PixelButton
        variant={auction.action === 'settle' ? 'primary' : 'secondary'}
        onClick={auction.action === 'settle' ? onSettle : onBid}
        disabled={isPending}
        fullWidth
      >
        {isPending ? <PixelLoader /> : auction.action === 'settle' ? 'Settle' : 'Bid'}
      </PixelButton>
    </article>
  )
}
