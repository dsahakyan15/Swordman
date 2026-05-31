import type { PortfolioInventoryItem } from './usePortfolioInventory'

type InventorySlotProps = {
  item: PortfolioInventoryItem
}

export function InventorySlot({ item }: InventorySlotProps) {
  return (
    <article className="grid gap-1 rounded-none bg-[url('/borderStone.png')] bg-cover bg-center bg-no-repeat p-5 text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)] [image-rendering:pixelated]">
      <div className="aspect-square px-[20px] py-[10px] overflow-hidden rounded-none  [image-rendering:pixelated]">
        {item.metadata.imageUrl ? (
          <img
            src={item.metadata.imageUrl}
            alt={item.metadata.name}
            className="h-full w-full object-cover "
          />
        ) : null}
      </div>
      <div className="min-w-0 px-[20px] py-0 text-sm uppercase tracking-[0.12em]">
        <p className="truncate font-bold text-purple-100">{item.metadata.name}</p>
        <p className="text-base text-orange-100">x{item.balance.toString()}</p>
      </div>
    </article>
  )
}
