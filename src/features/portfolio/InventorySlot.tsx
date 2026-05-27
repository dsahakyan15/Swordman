import type { PortfolioInventoryItem } from './usePortfolioInventory'

type InventorySlotProps = {
  item: PortfolioInventoryItem
}

export function InventorySlot({ item }: InventorySlotProps) {
  return (
    <article className="grid gap-2 rounded-none border border-indigo-500/50 bg-black/60 p-3 text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm">
      <div className="aspect-square overflow-hidden rounded-none border border-pink-400/30 bg-slate-950/70 [image-rendering:pixelated]">
        {item.metadata.imageUrl ? (
          <img
            src={item.metadata.imageUrl}
            alt={item.metadata.name}
            className="h-full w-full object-cover [image-rendering:pixelated]"
          />
        ) : null}
      </div>
      <div className="min-w-0 text-xs uppercase tracking-[0.12em]">
        <p className="truncate text-purple-100">{item.metadata.name}</p>
        <p className="text-orange-100">x{item.balance.toString()}</p>
      </div>
    </article>
  )
}
