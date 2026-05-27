# Bankeer Frontend Cycle 2 Portfolio Design

## Scope

Cycle 2 adds the player portfolio route and inventory display to the existing Bankeer frontend.

Included:

- `/portfolio` route
- portfolio navigation link in `PixelHeader`
- config-driven ERC-1155 inventory scan using `INVENTORY_TOKEN_IDS`
- wallet-gated profile panel
- COIN balance display for token `id = 1`
- inventory grid for owned item tokens where `id > 1`
- metadata and image loading through the existing `ipfsHelper`
- loading, empty, and fallback states

Out of scope:

- auction changes
- item transfer actions
- item equip/use actions
- automatic token discovery beyond the configured ID list
- persistent inventory cache

## Product Goals

- Let a connected player see their Bankeer wallet identity, COIN balance, and owned game items.
- Reuse the Cycle 1 Web3, IPFS, and pixel UI foundations instead of introducing a separate data layer.
- Keep the inventory scan explicit and cheap while the contract does not expose enumerable item IDs.

## Route and Navigation

Add a new route:

- `/portfolio`

Update `PixelHeader` desktop navigation:

- `Home`
- `Auction`
- `Portfolio`

The existing mobile menu button may remain a non-expanded placeholder for this cycle. It must not block access to `/portfolio` on desktop.

## Configuration

Add `INVENTORY_TOKEN_IDS` to `src/config/contracts.ts`.

Example initial value:

```ts
export const INVENTORY_TOKEN_IDS = [1, 2, 3, 4, 5] as const
```

The list is the only source of token IDs scanned by `/portfolio`.

Rules:

- `id = 1` is COIN.
- IDs greater than `1` are renderable inventory items.
- The list is manually maintained until the contract exposes token discovery.

## Contract Model

Cycle 2 depends on the existing `Bankeer` ERC-1155 contract methods:

- `uri(uint256 id) view returns (string)`
- `balanceOf(address account, uint256 id) view returns (uint256)`
- `balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])`

`balanceOfBatch` is required for the inventory list. `balanceOf` may remain useful for focused reads, but the portfolio inventory flow should use `balanceOfBatch`.

## Data Flow

### Wallet Gate

`PortfolioPage` reads the shared wallet state from `useWallet`.

If no wallet is connected:

- show a dark glass panel
- show a `Connect Wallet` action
- do not call `balanceOfBatch`

If the wallet is connected:

- call the portfolio hooks with the wallet address
- render the profile panel and inventory grid

### Balance Request

Create a small pure helper for the batch request:

- input: `account`, `ids`
- output:
  - `accounts`: same account repeated once per ID
  - `ids`: copied ID list

Example:

```ts
buildBalanceOfBatchRequest('0xabc', [1, 2, 3])
```

returns:

```ts
{
  accounts: ['0xabc', '0xabc', '0xabc'],
  ids: [1, 2, 3]
}
```

### Inventory Transformation

Normalize the batch result into portfolio items:

- COIN is the balance for `id = 1`
- inventory items are only IDs where:
  - `id > 1`
  - balance is greater than `0`

Each owned inventory item should include:

- `id`
- `balance`
- `metadata`

Metadata is loaded with the existing `Bankeer.uri(id)` plus `fetchTokenMetadata(uri, id)`.

### Metadata Behavior

Use the existing `ipfsHelper` for:

- `{id}` URI expansion
- IPFS gateway conversion
- metadata fetch
- image URL normalization
- in-memory memoization

If item metadata fails:

- keep the inventory slot visible
- use fallback name `Item #<id>`
- use an empty dark square image slot

If COIN metadata fails:

- keep the numeric COIN balance visible
- use text label `COIN`
- use an empty small coin icon placeholder

## UI Design

Reuse the Cycle 1 visual direction:

- layered pixel-art app background
- translucent dark glass panels
- thin indigo, violet, and sunset-accent borders
- monospace type
- square corners
- pixelated images

### Profile Panel

The profile panel sits at the top of `/portfolio`.

It shows:

- shortened wallet address
- COIN balance
- COIN icon if metadata loaded

Layout:

- mobile: stacked rows
- tablet and desktop: horizontal summary row

### Inventory Grid

Inventory grid behavior:

- `grid-cols-2`
- `sm:grid-cols-3`
- `md:grid-cols-4`
- `lg:grid-cols-6`

Each slot:

- `aspect-square`
- dark glass background
- thin accent border
- item image centered and pixelated
- item name and balance visible without overflowing

The grid renders only owned item tokens, not COIN.

### States

Disconnected:

- show wallet-required panel and connect action

Loading:

- show profile shell and pixel loader
- show skeleton inventory slots

Empty:

- show `No items found`
- keep the inventory panel visible

Error:

- show a concise error state inside the portfolio content
- use toast if the error is user-action-related
- do not crash the app shell

## Component and Hook Design

Create `src/features/portfolio`.

Recommended files:

- `PortfolioPage.tsx`
- `PortfolioPage.test.tsx`
- `InventoryGrid.tsx`
- `InventorySlot.tsx`
- `model.ts`
- `model.test.ts`
- `usePortfolioInventory.ts`

Responsibilities:

- `model.ts`
  - `buildBalanceOfBatchRequest`
  - `toOwnedInventoryItems`
- `usePortfolioInventory.ts`
  - read Bankeer through `getReadBankeerContract`
  - call `balanceOfBatch`
  - load COIN and item metadata
  - expose normalized loading, error, coin, and item state
- `PortfolioPage.tsx`
  - wallet gate
  - profile panel
  - inventory section composition
- `InventoryGrid.tsx`
  - responsive grid and empty/loading layout
- `InventorySlot.tsx`
  - single item slot rendering

## Testing Expectations

Add focused tests for:

- `buildBalanceOfBatchRequest(account, ids)`
- inventory filtering: only `id > 1` with balance greater than zero
- disconnected `PortfolioPage` state
- connected `PortfolioPage` rendering of COIN balance and owned items with mocked hooks
- route registration for `/portfolio`

Final verification should include:

- `npm test`
- `npm run lint`
- `npm run build`

Manual verification should include:

- `/portfolio` with disconnected wallet
- `/portfolio` with connected local wallet
- COIN balance display
- at least one owned item rendered from `INVENTORY_TOKEN_IDS`

## Non-Goals

- No item actions.
- No inventory sorting controls.
- No pagination.
- No drag-and-drop.
- No portfolio route guard redirect.
- No automatic discovery of token IDs.
