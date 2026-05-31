import { formatCompactNumber } from '../../lib/format'
import type { PortfolioInventoryItem } from './usePortfolioInventory'

type InventorySlotProps = {
  item: PortfolioInventoryItem
}

export function InventorySlot({ item }: InventorySlotProps) {
  const { metadata, balance, price } = item

  return (
    <article className="grid gap-1 rounded-none bg-[url('/borderStone.png')] bg-[length:100%_100%] bg-center bg-no-repeat p-5 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(129,140,248,0.4)] [image-rendering:pixelated]">
      <div className="aspect-square pt-[20px] overflow-hidden rounded-none  [image-rendering:pixelated]">
        {metadata.imageUrl ? (
          <img
            src={metadata.imageUrl}
            alt={metadata.name}
            className="h-full w-full object-cover [image-rendering:pixelated]"
          />
        ) : null}
      </div>
      <div className="min-w-0 px-[20px] py-0 text-sm uppercase tracking-[0.12em]">
        <p className="truncate font-bold text-purple-100">{metadata.name}</p>
        <div className="flex items-center justify-between gap-2 px-[10px] py-[2px]">
          <span className="text-base text-orange-100">x{balance.toString()}</span>
          <span 
            className="text-xs text-orange-200/80" 
            title={`${price.toString()} COIN`}
          >
            {formatCompactNumber(price)} COIN
          </span>
        </div>
      </div>
    </article>
  )
}

