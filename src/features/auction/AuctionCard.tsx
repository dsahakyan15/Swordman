import { PixelButton } from '../../components/pixel/PixelButton'
import { PixelLoader } from '../../components/pixel/PixelLoader'
import { formatCountdown, formatCompactNumber } from '../../lib/format'
import type { AuctionViewModel } from './types'

type AuctionCardProps = {
  auction: AuctionViewModel
  itemName: string
  itemImageUrl: string
  coinImageUrl: string
  isPending: boolean
  primaryActionLabel?: string
  primaryActionVariant?: 'primary' | 'secondary' | 'danger'
  secondaryActionLabel?: string
  secondaryActionVariant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  onBid: () => void
  onSettle: () => void
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
}

export function AuctionCard({
  auction,
  itemName,
  itemImageUrl,
  coinImageUrl,
  isPending,
  primaryActionLabel,
  primaryActionVariant,
  secondaryActionLabel,
  secondaryActionVariant = 'primary',
  onBid,
  onSettle,
  onPrimaryAction,
  onSecondaryAction,
}: AuctionCardProps) {
  const fallbackActionLabel = auction.action === 'settle' ? 'Settle' : 'Bid'
  const actionLabel = primaryActionLabel ?? fallbackActionLabel
  const actionVariant = primaryActionVariant ?? (auction.action === 'settle' ? 'primary' : 'secondary')
  const handlePrimaryAction = onPrimaryAction ?? (auction.action === 'settle' ? onSettle : onBid)

  return (
    <article className="grid gap-2 rounded-none border border-indigo-500/50 bg-black/60 p-3 text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(129,140,248,0.4)] sm:gap-3 sm:p-4">
      <div className="mx-auto aspect-square w-24 overflow-hidden rounded-none border border-pink-400/30 bg-slate-950/70 [image-rendering:pixelated] sm:w-32">
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
        <span className="font-sans">{formatCountdown(auction.secondsLeft)}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm text-orange-100">
        <span className="inline-flex items-center gap-2">
          {coinImageUrl ? (
            <img src={coinImageUrl} alt="" className="h-4 w-4 [image-rendering:pixelated]" />
          ) : (
            <span className="h-4 w-4 bg-orange-300" />
          )}
          <span className="font-sans">{formatCompactNumber(auction.highestBid)}</span> COIN
        </span>
        <span className="text-[11px] uppercase tracking-[0.16em] text-slate-200">
          {actionLabel}
        </span>
      </div>
      <PixelButton
        variant={actionVariant}
        onClick={handlePrimaryAction}
        disabled={isPending}
        fullWidth
      >
        {isPending ? <PixelLoader /> : actionLabel}
      </PixelButton>
      {secondaryActionLabel && onSecondaryAction ? (
        <PixelButton
          variant={secondaryActionVariant}
          onClick={onSecondaryAction}
          disabled={isPending}
          fullWidth
        >
          {secondaryActionLabel}
        </PixelButton>
      ) : null}
    </article>
  )
}
