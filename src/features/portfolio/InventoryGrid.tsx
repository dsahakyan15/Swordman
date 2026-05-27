import { PixelLoader } from '../../components/pixel/PixelLoader'
import { InventorySlot } from './InventorySlot'
import type { PortfolioInventoryItem } from './usePortfolioInventory'

type InventoryGridProps = {
  isLoading: boolean
  items: PortfolioInventoryItem[]
}

export function InventoryGrid({ isLoading, items }: InventoryGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-none border border-indigo-400/30 bg-slate-950/50 p-3 backdrop-blur-sm"
          >
            <PixelLoader />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-none border border-indigo-400/40 bg-slate-950/60 p-6 text-center text-sm uppercase tracking-[0.16em] text-white backdrop-blur-sm">
        No items found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((item) => (
        <InventorySlot key={item.id} item={item} />
      ))}
    </div>
  )
}
