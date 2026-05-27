# Bankeer Cycle 2 Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a working `/portfolio` page that shows wallet identity, COIN balance, and owned ERC-1155 inventory items from configured token IDs.

**Architecture:** Extend the existing Cycle 1 app shell, config, wallet provider, IPFS helper, and pixel UI primitives. Keep portfolio blockchain reads in a focused hook, keep inventory transformation in pure model helpers, and keep UI components presentational.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, ethers v6, Vitest, Testing Library

---

## File Structure

### Create

- `src/features/portfolio/model.ts`
- `src/features/portfolio/model.test.ts`
- `src/features/portfolio/usePortfolioInventory.ts`
- `src/features/portfolio/InventorySlot.tsx`
- `src/features/portfolio/InventoryGrid.tsx`
- `src/features/portfolio/PortfolioPage.tsx`
- `src/features/portfolio/PortfolioPage.test.tsx`

### Modify

- `src/config/contracts.ts`
- `src/lib/ipfsHelper.ts`
- `src/lib/ipfsHelper.test.ts`
- `src/components/pixel/PixelHeader.tsx`
- `src/components/pixel/WalletConnectButton.tsx`
- `src/components/pixel/WalletConnectButton.test.tsx`
- `src/app/AppRoutes.tsx`
- `src/app/AppRoutes.test.tsx`

## Task 1: Config Constants and EIP-1155 URI Expansion

**Files:**
- Modify: `src/config/contracts.ts`
- Modify: `src/lib/ipfsHelper.ts`
- Modify: `src/lib/ipfsHelper.test.ts`

- [ ] **Step 1: Add failing tests for EIP-1155 token URI expansion**

Update `src/lib/ipfsHelper.test.ts`:

```ts
import { expandTokenUri, fetchTokenMetadata, ipfsToHttp, resetIpfsCaches } from './ipfsHelper'

it('expands {id} as a 64-character lowercase hex string for ERC-1155 metadata', () => {
  expect(expandTokenUri('ipfs://QmMeta/{id}.json', 1)).toBe(
    'ipfs://QmMeta/0000000000000000000000000000000000000000000000000000000000000001.json',
  )
  expect(expandTokenUri('ipfs://QmMeta/{id}.json', 15)).toBe(
    'ipfs://QmMeta/000000000000000000000000000000000000000000000000000000000000000f.json',
  )
})
```

Update the existing fetch metadata test expectation:

```ts
expect(fetch).toHaveBeenCalledWith(
  'https://ipfs.io/ipfs/QmMeta/0000000000000000000000000000000000000000000000000000000000000001.json',
)
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/ipfsHelper.test.ts
```

Expected: FAIL because `expandTokenUri` currently uses decimal string replacement.

- [ ] **Step 3: Implement EIP-1155 expansion and explicit portfolio token constants**

Update `src/lib/ipfsHelper.ts`:

```ts
export function tokenIdToErc1155Hex(tokenId: bigint | number) {
  const hex = BigInt(tokenId).toString(16)
  return hex.padStart(64, '0')
}

export function expandTokenUri(template: string, tokenId: bigint | number) {
  return template.replace('{id}', tokenIdToErc1155Hex(tokenId))
}
```

Update `src/config/contracts.ts`:

```ts
export const COIN_ID = 1
export const INVENTORY_ITEM_IDS = [2, 3, 4, 5] as const
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/ipfsHelper.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/config/contracts.ts src/lib/ipfsHelper.ts src/lib/ipfsHelper.test.ts
git commit -m "feat: add portfolio token config and erc1155 uri expansion"
```

## Task 2: Working Mobile Navigation

**Files:**
- Modify: `src/components/pixel/PixelHeader.tsx`
- Modify: `src/components/pixel/WalletConnectButton.test.tsx`

- [ ] **Step 1: Add failing mobile nav behavior test**

Create or extend a header-focused test in `src/components/pixel/WalletConnectButton.test.tsx`:

```tsx
import { MemoryRouter } from 'react-router-dom'
import { PixelHeader } from './PixelHeader'

it('opens the mobile menu with a Portfolio link', () => {
  render(
    <MemoryRouter>
      <PixelHeader
        walletState={{ address: '', status: 'disconnected' }}
        onConnect={vi.fn()}
        onSwitchNetwork={vi.fn()}
      />
    </MemoryRouter>,
  )

  fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))

  expect(screen.getByRole('link', { name: /portfolio/i })).toHaveAttribute('href', '/portfolio')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/pixel/WalletConnectButton.test.tsx
```

Expected: FAIL because the mobile menu button does not open links yet.

- [ ] **Step 3: Implement desktop Portfolio link and mobile dropdown**

Update `src/components/pixel/PixelHeader.tsx`:

```tsx
import { useState } from 'react'
```

Inside `PixelHeader`:

```tsx
const [isMenuOpen, setIsMenuOpen] = useState(false)
const links = [
  { to: '/', label: 'Home' },
  { to: '/auction', label: 'Auction' },
  { to: '/portfolio', label: 'Portfolio' },
]
```

Render desktop links from `links`. Make the mobile button toggle `isMenuOpen`, and render a dropdown:

```tsx
{isMenuOpen ? (
  <div className="absolute left-4 right-4 top-full z-30 grid gap-2 border border-indigo-400/40 bg-slate-950/85 p-3 backdrop-blur-sm md:hidden">
    {links.map((link) => (
      <Link
        key={link.to}
        to={link.to}
        onClick={() => setIsMenuOpen(false)}
        className="border border-white/10 px-3 py-2 uppercase tracking-[0.18em] text-white"
      >
        {link.label}
      </Link>
    ))}
  </div>
) : null}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/components/pixel/WalletConnectButton.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/pixel/PixelHeader.tsx src/components/pixel/WalletConnectButton.test.tsx
git commit -m "feat: add responsive portfolio navigation"
```

## Task 3: Portfolio Model Helpers

**Files:**
- Create: `src/features/portfolio/model.ts`
- Create: `src/features/portfolio/model.test.ts`

- [ ] **Step 1: Write failing model tests**

Create `src/features/portfolio/model.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { COIN_ID } from '../../config/contracts'
import {
  buildBalanceOfBatchRequest,
  buildPortfolioTokenIds,
  toOwnedInventoryItems,
} from './model'

describe('portfolio model', () => {
  it('repeats account for every token id in balanceOfBatch', () => {
    expect(buildBalanceOfBatchRequest('0xabc', [1, 2, 3])).toEqual({
      accounts: ['0xabc', '0xabc', '0xabc'],
      ids: [1, 2, 3],
    })
  })

  it('always includes COIN_ID before inventory item ids', () => {
    expect(buildPortfolioTokenIds([2, 3])).toEqual([COIN_ID, 2, 3])
  })

  it('filters owned inventory items to item ids with positive balance', () => {
    expect(toOwnedInventoryItems([1, 2, 3, 4], [100n, 0n, 2n, 5n])).toEqual([
      { id: 3, balance: 2n },
      { id: 4, balance: 5n },
    ])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/portfolio/model.test.ts
```

Expected: FAIL because `model.ts` does not exist.

- [ ] **Step 3: Implement model helpers**

Create `src/features/portfolio/model.ts`:

```ts
import { COIN_ID } from '../../config/contracts'

export type OwnedInventoryToken = {
  id: number
  balance: bigint
}

export function buildPortfolioTokenIds(itemIds: readonly number[]) {
  return [COIN_ID, ...itemIds]
}

export function buildBalanceOfBatchRequest(account: string, ids: readonly number[]) {
  return {
    accounts: ids.map(() => account),
    ids: [...ids],
  }
}

export function toOwnedInventoryItems(ids: readonly number[], balances: readonly bigint[]) {
  return ids.reduce<OwnedInventoryToken[]>((items, id, index) => {
    const balance = balances[index] ?? 0n
    if (id > COIN_ID && balance > 0n) {
      items.push({ id, balance })
    }
    return items
  }, [])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/features/portfolio/model.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/portfolio/model.ts src/features/portfolio/model.test.ts
git commit -m "feat: add portfolio inventory model"
```

## Task 4: Portfolio Inventory Hook

**Files:**
- Create: `src/features/portfolio/usePortfolioInventory.ts`

- [ ] **Step 1: Implement hook**

Create `src/features/portfolio/usePortfolioInventory.ts`:

```ts
import { useEffect, useState } from 'react'
import { COIN_ID, INVENTORY_ITEM_IDS } from '../../config/contracts'
import { fetchTokenMetadata, type TokenMetadata } from '../../lib/ipfsHelper'
import { getReadBankeerContract } from '../../web3/contracts'
import {
  buildBalanceOfBatchRequest,
  buildPortfolioTokenIds,
  toOwnedInventoryItems,
  type OwnedInventoryToken,
} from './model'

export type PortfolioInventoryItem = OwnedInventoryToken & {
  metadata: TokenMetadata
}

export type PortfolioInventoryState = {
  isLoading: boolean
  error: string
  coinBalance: bigint
  coinMetadata: TokenMetadata | null
  items: PortfolioInventoryItem[]
}

const initialState: PortfolioInventoryState = {
  isLoading: false,
  error: '',
  coinBalance: 0n,
  coinMetadata: null,
  items: [],
}

export function usePortfolioInventory(account: string) {
  const [state, setState] = useState<PortfolioInventoryState>(initialState)

  useEffect(() => {
    if (!account) {
      return
    }

    let isMounted = true

    async function loadInventory() {
      try {
        setState((current) => ({ ...current, isLoading: true, error: '' }))
        const contract = getReadBankeerContract()
        const ids = buildPortfolioTokenIds(INVENTORY_ITEM_IDS)
        const request = buildBalanceOfBatchRequest(account, ids)
        const balances = (await contract.balanceOfBatch(request.accounts, request.ids)) as bigint[]
        const uri = (await contract.uri(COIN_ID)) as string
        const coinMetadata = await fetchTokenMetadata(uri, COIN_ID)
        const ownedItems = toOwnedInventoryItems(ids, balances)
        const items = await Promise.all(
          ownedItems.map(async (item) => {
            try {
              const itemUri = (await contract.uri(item.id)) as string
              const metadata = await fetchTokenMetadata(itemUri, item.id)
              return { ...item, metadata }
            } catch {
              return {
                ...item,
                metadata: {
                  name: `Item #${item.id}`,
                  imageUrl: '',
                  rawUri: '',
                },
              }
            }
          }),
        )

        if (isMounted) {
          setState({
            isLoading: false,
            error: '',
            coinBalance: balances[0] ?? 0n,
            coinMetadata,
            items,
          })
        }
      } catch (error) {
        if (isMounted) {
          setState({
            ...initialState,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load portfolio',
          })
        }
      }
    }

    void loadInventory()

    return () => {
      isMounted = false
    }
  }, [account])

  return state
}
```

- [ ] **Step 2: Run build to verify hook types**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/usePortfolioInventory.ts
git commit -m "feat: add portfolio inventory hook"
```

## Task 5: Portfolio UI and Route

**Files:**
- Create: `src/features/portfolio/InventorySlot.tsx`
- Create: `src/features/portfolio/InventoryGrid.tsx`
- Create: `src/features/portfolio/PortfolioPage.tsx`
- Create: `src/features/portfolio/PortfolioPage.test.tsx`
- Modify: `src/app/AppRoutes.tsx`
- Modify: `src/app/AppRoutes.test.tsx`

- [ ] **Step 1: Write failing page and route tests**

Create `src/features/portfolio/PortfolioPage.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PortfolioPage } from './PortfolioPage'

const connect = vi.fn()

vi.mock('../../web3/useWallet', () => ({
  useWallet: () => ({
    walletState: { address: '', status: 'disconnected' },
    connect,
  }),
}))

vi.mock('./usePortfolioInventory', () => ({
  usePortfolioInventory: () => ({
    isLoading: false,
    error: '',
    coinBalance: 0n,
    coinMetadata: null,
    items: [],
  }),
}))

describe('PortfolioPage', () => {
  it('shows a connect wallet state when disconnected', () => {
    render(<PortfolioPage />)
    fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }))
    expect(connect).toHaveBeenCalled()
  })
})
```

Update `src/app/AppRoutes.test.tsx` to include `/portfolio`:

```tsx
vi.mock('../features/portfolio/PortfolioPage', () => ({
  PortfolioPage: () => <h1>Portfolio</h1>,
}))

it('renders the portfolio page at /portfolio', () => {
  render(
    <MemoryRouter initialEntries={['/portfolio']}>
      <AppRoutes />
    </MemoryRouter>,
  )

  const shell = screen.getByTestId('app-shell')
  const heading = screen.getByRole('heading', { level: 1, name: 'Portfolio' })

  expect(shell).toContainElement(heading)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/features/portfolio/PortfolioPage.test.tsx src/app/AppRoutes.test.tsx
```

Expected: FAIL because portfolio UI and route do not exist yet.

- [ ] **Step 3: Implement inventory UI and route**

Create `src/features/portfolio/InventorySlot.tsx`:

```tsx
import type { PortfolioInventoryItem } from './usePortfolioInventory'

export function InventorySlot({ item }: { item: PortfolioInventoryItem }) {
  return (
    <article className="grid gap-2 rounded-none border border-indigo-500/50 bg-black/60 p-3 text-white backdrop-blur-sm">
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
```

Create `src/features/portfolio/InventoryGrid.tsx`:

```tsx
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
            className="aspect-square border border-indigo-400/30 bg-slate-950/50 p-3 backdrop-blur-sm"
          >
            <PixelLoader />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="border border-indigo-400/40 bg-slate-950/60 p-6 text-center text-white backdrop-blur-sm">
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
```

Create `src/features/portfolio/PortfolioPage.tsx`:

```tsx
import { PixelButton } from '../../components/pixel/PixelButton'
import { shortenAddress } from '../../lib/format'
import { useWallet } from '../../web3/useWallet'
import { InventoryGrid } from './InventoryGrid'
import { usePortfolioInventory } from './usePortfolioInventory'

export function PortfolioPage() {
  const { walletState, connect } = useWallet()
  const inventory = usePortfolioInventory(walletState.address)

  if (walletState.status !== 'connected') {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl items-center justify-center px-4 py-12 text-center">
        <div className="grid gap-4 border border-indigo-400/40 bg-slate-950/65 p-6 text-white backdrop-blur-sm">
          <h1 className="text-3xl uppercase tracking-[0.18em]">Portfolio</h1>
          <p className="text-sm text-slate-200">Connect your wallet to view your Bankeer inventory.</p>
          <PixelButton variant="primary" onClick={() => void connect()}>
            Connect Wallet
          </PixelButton>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex flex-col gap-4 border border-indigo-400/40 bg-slate-950/60 p-4 text-white backdrop-blur-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl uppercase tracking-[0.18em]">Portfolio</h1>
          <p className="text-sm text-purple-100">{shortenAddress(walletState.address)}</p>
        </div>
        <div className="flex items-center gap-3 border border-orange-400/40 bg-black/40 px-4 py-3">
          {inventory.coinMetadata?.imageUrl ? (
            <img
              src={inventory.coinMetadata.imageUrl}
              alt=""
              className="h-6 w-6 [image-rendering:pixelated]"
            />
          ) : (
            <span className="h-6 w-6 bg-orange-300" />
          )}
          <span>{inventory.coinBalance.toString()} COIN</span>
        </div>
      </div>

      {inventory.error ? <p className="text-pink-100">{inventory.error}</p> : null}
      <InventoryGrid isLoading={inventory.isLoading} items={inventory.items} />
    </section>
  )
}
```

Update `src/app/AppRoutes.tsx`:

```tsx
import { PortfolioPage } from '../features/portfolio/PortfolioPage'
```

Add route:

```tsx
<Route path="portfolio" element={<PortfolioPage />} />
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- src/features/portfolio/PortfolioPage.test.tsx src/app/AppRoutes.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/portfolio/InventorySlot.tsx src/features/portfolio/InventoryGrid.tsx src/features/portfolio/PortfolioPage.tsx src/features/portfolio/PortfolioPage.test.tsx src/app/AppRoutes.tsx src/app/AppRoutes.test.tsx
git commit -m "feat: add portfolio page and route"
```

## Task 6: Final Verification

**Files:**
- Modify as needed based on verification failures.

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Run dev server**

```bash
npm run dev -- --host 127.0.0.1 --port 4173
```

Expected: Vite serves the app locally.

- [ ] **Step 5: Final commit**

```bash
git add src docs/superpowers/plans/2026-05-27-bankeer-cycle-2-portfolio-implementation.md
git commit -m "feat: deliver bankeer portfolio cycle 2"
```

## Self-Review Notes

- Spec coverage:
  - mobile nav is covered by Task 2
  - `COIN_ID` and `INVENTORY_ITEM_IDS` split is covered by Task 1
  - EIP-1155 URI expansion is covered by Task 1
  - `balanceOfBatch` request modeling is covered by Task 3
  - portfolio hook is covered by Task 4, and avoids a synchronous disconnected-state reset inside `useEffect`
  - `/portfolio` UI and route are covered by Task 5
- Placeholder scan:
  - no open placeholders are intentionally left in the plan
- Type consistency:
  - `PortfolioInventoryItem`, `OwnedInventoryToken`, `COIN_ID`, and `INVENTORY_ITEM_IDS` are used consistently across tasks
