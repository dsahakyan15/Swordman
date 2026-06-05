import { FaBalanceScaleRight } from 'react-icons/fa'

import { PixelButton } from '../../components/pixel/PixelButton'
import { PixelLoader } from '../../components/pixel/PixelLoader'
import { InventorySlot } from './InventorySlot'
import type { PortfolioInventoryItem } from './usePortfolioInventory'

type InventoryGridProps = {
  isLoading: boolean
  items: PortfolioInventoryItem[]
  pendingItemId?: number | null
  selectedItemId?: number | null
  onSelectItem?: (item: PortfolioInventoryItem) => void
  onOpenCreateAuction?: (item: PortfolioInventoryItem) => void
}

export function InventoryGrid({
  isLoading,
  items,
  pendingItemId = null,
  selectedItemId = null,
  onSelectItem,
  onOpenCreateAuction,
}: InventoryGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-none bg-slate-950/50 p-5 backdrop-blur-sm"
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, index) => {
        const isSelected = selectedItemId === item.id

        return (
          <div
            key={item.id}
            className={[
              'relative grid gap-3 transition-all duration-300',
              index % 2 === 1 ? 'xl:[&>aside]:right-auto xl:[&>aside]:left-0 xl:[&>aside]:-translate-x-[calc(100%+0.75rem)]' : '',
            ].join(' ')}
          >
            <InventorySlot
              item={item}
              isSelected={isSelected}
              onSelect={onSelectItem}
            />

            <aside
              className={[
                'grid overflow-hidden transition-all duration-300 md:absolute md:left-auto md:right-0 md:top-1/2 md:z-20 md:w-44 md:-translate-y-1/2 md:translate-x-[calc(100%+0.75rem)]',
                isSelected
                  ? 'max-h-36 opacity-100'
                  : 'pointer-events-none max-h-0 translate-y-2 opacity-0 md:max-h-36 md:translate-y-0',
              ].join(' ')}
              aria-hidden={!isSelected}
            >
              <PixelButton
                type="button"
                variant="primary"
                className="flex min-h-16 items-center justify-center gap-3 px-3 text-xs"
                disabled={pendingItemId === item.id}
                onClick={() => onOpenCreateAuction?.(item)}
              >
                <FaBalanceScaleRight aria-hidden="true" />
                Create Auction
              </PixelButton>
            </aside>
          </div>
        )
      })}
    </div>
  )
}
