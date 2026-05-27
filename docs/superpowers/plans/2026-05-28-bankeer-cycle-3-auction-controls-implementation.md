# Bankeer Cycle 3 Auction Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add configurable contract addresses, working home buttons, owned-item auction creation, buy/settle auction actions, and card hover glow.

**Architecture:** Keep contract interaction logic in focused action helpers and hooks; keep presentational card components small. Reuse the existing wallet, toast, transaction error, contract, and portfolio inventory patterns instead of adding new routes or state libraries.

**Tech Stack:** React 19, TypeScript, Vite, ethers v6, Vitest, Testing Library, Tailwind CSS, `react-icons/fa`.

---

## File Structure

- Modify `package.json` and lockfile: add `react-icons`.
- Modify `src/config/contracts.ts`: read Vite env contract addresses with localhost fallbacks.
- Modify `src/config/contracts.test.ts`: cover env/fallback ABI config behavior.
- Modify `src/features/home/HomePage.tsx`: wire `Enter Game` and `Connect Wallet`.
- Modify `src/features/home/HomePage.test.tsx`: test navigation/connect behavior.
- Modify `src/features/auction/actions.ts`: keep `submitBidWithApproval`; add `createAuctionWithApproval`.
- Modify `src/features/auction/actions.test.ts`: cover create auction approval path.
- Modify `src/features/auction/useAuctionActions.ts`: keep buy/settle wired to `buyRequest` and `resolveAuc`.
- Modify `src/features/auction/AuctionCard.test.tsx`: cover buy and settle button callbacks.
- Modify `src/features/portfolio/InventorySlot.tsx`: add icon-only auction button and compact form.
- Modify `src/features/portfolio/InventoryGrid.tsx`: pass auction creation handlers to slots.
- Modify `src/features/portfolio/PortfolioPage.tsx`: wire `useCreateAuction` and refresh inventory.
- Create `src/features/portfolio/useCreateAuction.ts`: portfolio hook for `createAuctionWithApproval`.
- Modify `src/features/portfolio/PortfolioPage.test.tsx`: cover icon title and form submission wiring.

---

### Task 1: Dependency and Contract Address Configuration

**Files:**
- Modify: `package.json`
- Modify: package lockfile
- Modify: `src/config/contracts.ts`
- Modify: `src/config/contracts.test.ts`

- [ ] **Step 1: Install `react-icons`**

Run:

```bash
npm install react-icons
```

Expected: `package.json` and the lockfile include `react-icons`.

- [ ] **Step 2: Update the contract config test**

Replace `src/config/contracts.test.ts` with:

```ts
import { describe, expect, it } from 'vitest'

import {
  auctionAddress,
  auctionConfig,
  bankeerAddress,
  bankeerConfig,
  LOCAL_AUCTION_ADDRESS,
  LOCAL_BANKEER_ADDRESS,
} from './contracts'

describe('contract configs', () => {
  it('exposes ABI arrays from imported contract artifacts', () => {
    expect(Array.isArray(bankeerConfig.abi)).toBe(true)
    expect(Array.isArray(auctionConfig.abi)).toBe(true)
  })

  it('uses localhost contract addresses as source defaults', () => {
    expect(LOCAL_BANKEER_ADDRESS).toBe('0x5FbDB2315678afecb367f032d93F642f64180aa3')
    expect(LOCAL_AUCTION_ADDRESS).toBe('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')
    expect(bankeerAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
    expect(auctionAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
  })
})
```

- [ ] **Step 3: Run the focused config test and verify it fails if constants are missing**

Run:

```bash
npm test -- src/config/contracts.test.ts
```

Expected: FAIL until `LOCAL_BANKEER_ADDRESS` and `LOCAL_AUCTION_ADDRESS` are exported.

- [ ] **Step 4: Implement env-backed address fallbacks**

Update `src/config/contracts.ts`:

```ts
import type { InterfaceAbi } from 'ethers'

import auctionAbi from '../abi/Auction.json'
import bankeerAbi from '../abi/Bankeer.json'

type ImportedContractAbi = Exclude<InterfaceAbi, string>
type ContractArtifact = {
  abi: ImportedContractAbi
}
type ContractJson = ImportedContractAbi | ContractArtifact

function resolveAbi(contractJson: ContractJson) {
  return 'abi' in contractJson ? contractJson.abi : contractJson
}

export const LOCAL_RPC_URL = 'http://127.0.0.1:8545'
export const LOCAL_CHAIN_ID = 31337
export const LOCAL_CHAIN_ID_HEX = '0x7a69'
export const COIN_ID = 1
export const INVENTORY_ITEM_IDS = [2, 3, 4, 5] as const
export const LOCAL_BANKEER_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
export const LOCAL_AUCTION_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

export const bankeerAddress = import.meta.env.VITE_BANKEER_ADDRESS ?? LOCAL_BANKEER_ADDRESS
export const auctionAddress = import.meta.env.VITE_AUCTION_ADDRESS ?? LOCAL_AUCTION_ADDRESS

export const bankeerConfig = {
  address: bankeerAddress,
  abi: resolveAbi(bankeerAbi),
} as const

export const auctionConfig = {
  address: auctionAddress,
  abi: resolveAbi(auctionAbi),
} as const
```

- [ ] **Step 5: Run the config test**

Run:

```bash
npm test -- src/config/contracts.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit dependency and config work**

```bash
git add package.json package-lock.json src/config/contracts.ts src/config/contracts.test.ts
git commit -m "feat: configure contract address fallbacks"
```

---

### Task 2: Working Home Page Buttons

**Files:**
- Modify: `src/features/home/HomePage.tsx`
- Modify: `src/features/home/HomePage.test.tsx`

- [ ] **Step 1: Replace the home page test**

Replace `src/features/home/HomePage.test.tsx` with:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HomePage } from './HomePage'

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  navigate: vi.fn(),
}))

vi.mock('../../web3/useWallet', () => ({
  useWallet: () => ({
    connect: mocks.connect,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  }
})

describe('HomePage', () => {
  beforeEach(() => {
    mocks.connect.mockReset()
    mocks.navigate.mockReset()
  })

  it('renders the hero copy, actions, and placeholder slots', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /bankeer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enter game/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
    expect(screen.getAllByLabelText(/featured slot/i)).toHaveLength(3)
  })

  it('navigates to auction from Enter Game', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /enter game/i }))

    expect(mocks.navigate).toHaveBeenCalledWith('/auction')
  })

  it('connects the wallet from Connect Wallet', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }))

    expect(mocks.connect).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run the home test and verify it fails**

Run:

```bash
npm test -- src/features/home/HomePage.test.tsx
```

Expected: FAIL because `HomePage` does not call `useNavigate` or `connect`.

- [ ] **Step 3: Implement home button actions**

Update `src/features/home/HomePage.tsx`:

```tsx
import { useNavigate } from 'react-router-dom'

import { PixelButton } from '../../components/pixel/PixelButton'
import { useWallet } from '../../web3/useWallet'

export function HomePage() {
  const navigate = useNavigate()
  const { connect } = useWallet()

  return (
    <section className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12 text-center md:px-8">
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-5">
        <p className="text-xs uppercase tracking-[0.28em] text-purple-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
          Twilight Market / Localhost 8545
        </p>
        <h1 className="text-5xl uppercase tracking-[0.14em] text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.9)] sm:text-6xl md:text-7xl">
          BANKEER
        </h1>
        <p className="max-w-[34ch] text-sm leading-7 text-slate-100 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] sm:text-base">
          A fantasy auction hall rendered like modern indie pixel art: layered skies,
          glass panels, and local-chain bidding.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <PixelButton variant="primary" fullWidth onClick={() => navigate('/auction')}>
            Enter Game
          </PixelButton>
          <PixelButton variant="secondary" fullWidth onClick={() => void connect()}>
            Connect Wallet
          </PixelButton>
        </div>
        <div className="grid w-full max-w-sm grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              aria-label="Featured slot"
              className="aspect-square bg-slate-950/60 shadow-[inset_0_0_0_1px_rgba(129,140,248,0.32)] backdrop-blur-sm [image-rendering:pixelated]"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run the home test**

Run:

```bash
npm test -- src/features/home/HomePage.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit home button work**

```bash
git add src/features/home/HomePage.tsx src/features/home/HomePage.test.tsx
git commit -m "feat: wire home page actions"
```

---

### Task 3: Auction Action Helpers

**Files:**
- Modify: `src/features/auction/actions.ts`
- Modify: `src/features/auction/actions.test.ts`

- [ ] **Step 1: Add create auction tests**

Append these tests to `src/features/auction/actions.test.ts`:

```ts
  it('creates an auction without approval when the auction contract is already approved', async () => {
    const bankeer = {
      isApprovedForAll: vi.fn().mockResolvedValue(true),
      setApprovalForAll: vi.fn(),
    }
    const auction = {
      createAuc: vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue(undefined) }),
    }

    await createAuctionWithApproval({
      bankeer,
      auction,
      userAddress: '0xuser',
      auctionAddress: '0xabcd',
      duration: 3600,
      swordId: 3,
      amount: 1,
      startingBid: 50,
    })

    expect(bankeer.setApprovalForAll).not.toHaveBeenCalled()
    expect(auction.createAuc).toHaveBeenCalledWith(3600, 3, 1, 50)
  })

  it('approves before creating an auction when approval is missing', async () => {
    const approvalWait = vi.fn().mockResolvedValue(undefined)
    const createWait = vi.fn().mockResolvedValue(undefined)
    const bankeer = {
      isApprovedForAll: vi.fn().mockResolvedValue(false),
      setApprovalForAll: vi.fn().mockResolvedValue({ wait: approvalWait }),
    }
    const auction = {
      createAuc: vi.fn().mockResolvedValue({ wait: createWait }),
    }

    await createAuctionWithApproval({
      bankeer,
      auction,
      userAddress: '0xuser',
      auctionAddress: '0xabcd',
      duration: 3600,
      swordId: 3,
      amount: 1,
      startingBid: 50,
    })

    expect(bankeer.setApprovalForAll).toHaveBeenCalledWith('0xabcd', true)
    expect(approvalWait).toHaveBeenCalledTimes(1)
    expect(auction.createAuc).toHaveBeenCalledWith(3600, 3, 1, 50)
    expect(createWait).toHaveBeenCalledTimes(1)
  })
```

Update the import at the top of `src/features/auction/actions.test.ts`:

```ts
import { createAuctionWithApproval, submitBidWithApproval } from './actions'
```

- [ ] **Step 2: Run the action tests and verify they fail**

Run:

```bash
npm test -- src/features/auction/actions.test.ts
```

Expected: FAIL because `createAuctionWithApproval` is not exported.

- [ ] **Step 3: Implement create auction helper**

Update `src/features/auction/actions.ts`:

```ts
export type BankeerApprovalContract = {
  isApprovedForAll: (user: string, operator: string) => Promise<boolean>
  setApprovalForAll: (
    operator: string,
    approved: boolean,
  ) => Promise<{ wait: () => Promise<unknown> }>
}

export type AuctionBidContract = {
  buyRequest: (
    auctionId: number,
    amount: number,
  ) => Promise<{ wait: () => Promise<unknown> }>
}

export type AuctionCreateContract = {
  createAuc: (
    duration: number,
    swordId: number,
    amount: number,
    startingBid: number,
  ) => Promise<{ wait: () => Promise<unknown> }>
}

type SubmitBidArgs = {
  bankeer: BankeerApprovalContract
  auction: AuctionBidContract
  userAddress: string
  auctionAddress: string
  auctionId: number
  amount: number
}

type CreateAuctionArgs = {
  bankeer: BankeerApprovalContract
  auction: AuctionCreateContract
  userAddress: string
  auctionAddress: string
  duration: number
  swordId: number
  amount: number
  startingBid: number
}

async function ensureAuctionApproval({
  bankeer,
  userAddress,
  auctionAddress,
}: {
  bankeer: BankeerApprovalContract
  userAddress: string
  auctionAddress: string
}) {
  const approved = await bankeer.isApprovedForAll(userAddress, auctionAddress)

  if (!approved) {
    const approvalTx = await bankeer.setApprovalForAll(auctionAddress, true)
    await approvalTx.wait()
  }
}

export async function submitBidWithApproval({
  bankeer,
  auction,
  userAddress,
  auctionAddress,
  auctionId,
  amount,
}: SubmitBidArgs) {
  await ensureAuctionApproval({ bankeer, userAddress, auctionAddress })

  const bidTx = await auction.buyRequest(auctionId, amount)
  await bidTx.wait()
}

export async function createAuctionWithApproval({
  bankeer,
  auction,
  userAddress,
  auctionAddress,
  duration,
  swordId,
  amount,
  startingBid,
}: CreateAuctionArgs) {
  await ensureAuctionApproval({ bankeer, userAddress, auctionAddress })

  const createTx = await auction.createAuc(duration, swordId, amount, startingBid)
  await createTx.wait()
}
```

- [ ] **Step 4: Run the action tests**

Run:

```bash
npm test -- src/features/auction/actions.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit action helpers**

```bash
git add src/features/auction/actions.ts src/features/auction/actions.test.ts
git commit -m "feat: add auction creation action"
```

---

### Task 4: Portfolio Auction Creation UI

**Files:**
- Create: `src/features/portfolio/useCreateAuction.ts`
- Modify: `src/features/portfolio/InventorySlot.tsx`
- Modify: `src/features/portfolio/InventoryGrid.tsx`
- Modify: `src/features/portfolio/PortfolioPage.tsx`
- Modify: `src/features/portfolio/PortfolioPage.test.tsx`

- [ ] **Step 1: Add portfolio creation UI test**

Extend mocks in `src/features/portfolio/PortfolioPage.test.tsx` so `usePortfolioInventory` returns one item for connected-wallet tests and mock `useCreateAuction`:

```tsx
const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  createAuction: vi.fn(),
  walletState: { address: '', status: 'disconnected' },
  inventoryItems: [] as Array<{
    id: number
    balance: bigint
    metadata: { name: string; imageUrl: string; rawUri: string }
  }>,
}))
```

Use these mocks:

```tsx
vi.mock('./usePortfolioInventory', () => ({
  usePortfolioInventory: () => ({
    isLoading: false,
    error: '',
    coinBalance: 0n,
    coinMetadata: null,
    items: mocks.inventoryItems,
    refresh: vi.fn(),
  }),
}))

vi.mock('./useCreateAuction', () => ({
  useCreateAuction: () => ({
    pendingItemId: null,
    createAuction: mocks.createAuction,
  }),
}))
```

Add this test:

```tsx
  it('shows an icon-only create auction control for owned items and submits the form', () => {
    mocks.walletState = { address: '0x1234', status: 'connected' }
    mocks.inventoryItems = [
      {
        id: 3,
        balance: 2n,
        metadata: { name: 'Iron Fang', imageUrl: '', rawUri: 'ipfs://item' },
      },
    ]

    render(<PortfolioPage />)

    fireEvent.click(screen.getByTitle('Create Auction'))
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/starting bid/i), { target: { value: '25' } })
    fireEvent.change(screen.getByLabelText(/duration/i), { target: { value: '3600' } })
    fireEvent.click(screen.getByRole('button', { name: /submit auction/i }))

    expect(mocks.createAuction).toHaveBeenCalledWith({
      itemId: 3,
      amount: 1,
      startingBid: 25,
      duration: 3600,
      userAddress: '0x1234',
    })
  })
```

- [ ] **Step 2: Run the portfolio page test and verify it fails**

Run:

```bash
npm test -- src/features/portfolio/PortfolioPage.test.tsx
```

Expected: FAIL because the icon button and hook do not exist.

- [ ] **Step 3: Create `useCreateAuction`**

Create `src/features/portfolio/useCreateAuction.ts`:

```ts
import { useState } from 'react'

import { useToasts } from '../../components/pixel/ToastProvider'
import { auctionAddress } from '../../config/contracts'
import { createAuctionWithApproval, type AuctionCreateContract, type BankeerApprovalContract } from '../auction/actions'
import { normalizeTransactionError } from '../../lib/transactionErrors'
import { getWriteAuctionContract, getWriteBankeerContract } from '../../web3/contracts'

type CreateAuctionInput = {
  itemId: number
  amount: number
  startingBid: number
  duration: number
  userAddress: string
}

export function useCreateAuction(onCreated: () => void) {
  const [pendingItemId, setPendingItemId] = useState<number | null>(null)
  const { pushToast } = useToasts()

  async function createAuction({
    itemId,
    amount,
    startingBid,
    duration,
    userAddress,
  }: CreateAuctionInput) {
    try {
      setPendingItemId(itemId)
      const bankeer = (await getWriteBankeerContract()) as unknown as BankeerApprovalContract
      const auction = (await getWriteAuctionContract()) as unknown as AuctionCreateContract

      await createAuctionWithApproval({
        bankeer,
        auction,
        userAddress,
        auctionAddress,
        duration,
        swordId: itemId,
        amount,
        startingBid,
      })

      pushToast('Auction created', 'success')
      onCreated()
    } catch (error) {
      const normalized = normalizeTransactionError(error)
      pushToast(normalized.message, normalized.kind === 'rejected' ? 'info' : 'error')
    } finally {
      setPendingItemId(null)
    }
  }

  return { pendingItemId, createAuction }
}
```

- [ ] **Step 4: Add refresh support to portfolio inventory hook**

Update `src/features/portfolio/usePortfolioInventory.ts` so state includes a `refresh` callback:

```ts
import { useCallback, useEffect, useState } from 'react'
```

Inside `usePortfolioInventory`, add:

```ts
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = useCallback(() => setRefreshKey((current) => current + 1), [])
```

Change the effect dependency array from:

```ts
  }, [account])
```

to:

```ts
  }, [account, refreshKey])
```

Return:

```ts
  return { ...state, refresh }
```

- [ ] **Step 5: Update inventory slot UI**

Update `src/features/portfolio/InventorySlot.tsx`:

```tsx
import { FormEvent, useState } from 'react'
import { FaBalanceScaleRight } from 'react-icons/fa'

import { PixelButton } from '../../components/pixel/PixelButton'
import { PixelLoader } from '../../components/pixel/PixelLoader'
import type { PortfolioInventoryItem } from './usePortfolioInventory'

type CreateAuctionValues = {
  itemId: number
  amount: number
  startingBid: number
  duration: number
}

type InventorySlotProps = {
  item: PortfolioInventoryItem
  isPending?: boolean
  onCreateAuction?: (values: CreateAuctionValues) => void
}

export function InventorySlot({ item, isPending = false, onCreateAuction }: InventorySlotProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [amount, setAmount] = useState('1')
  const [startingBid, setStartingBid] = useState('1')
  const [duration, setDuration] = useState('3600')

  function submitAuction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onCreateAuction?.({
      itemId: item.id,
      amount: Number(amount),
      startingBid: Number(startingBid),
      duration: Number(duration),
    })
  }

  return (
    <article className="pixel-stone-card grid gap-2 rounded-none p-3 text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition-shadow hover:shadow-[0_0_28px_rgba(251,191,36,0.42),0_18px_40px_rgba(0,0,0,0.28)] focus-within:shadow-[0_0_28px_rgba(251,191,36,0.42),0_18px_40px_rgba(0,0,0,0.28)]">
      <div className="aspect-square overflow-hidden [image-rendering:pixelated]">
        {item.metadata.imageUrl ? (
          <img
            src={item.metadata.imageUrl}
            alt={item.metadata.name}
            className="h-full w-full object-cover [image-rendering:pixelated]"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 items-start justify-between gap-2 text-xs uppercase tracking-[0.12em]">
        <div className="min-w-0">
          <p className="truncate text-purple-100">{item.metadata.name}</p>
          <p className="text-orange-100">x{item.balance.toString()}</p>
        </div>
        <button
          type="button"
          title="Create Auction"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-none border border-amber-300/80 bg-black/70 text-amber-200 transition-shadow hover:shadow-[0_0_18px_rgba(251,191,36,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"
          onClick={() => setIsFormOpen((current) => !current)}
        >
          <FaBalanceScaleRight aria-hidden="true" />
        </button>
      </div>
      {isFormOpen ? (
        <form className="grid gap-2 text-xs uppercase tracking-[0.12em]" onSubmit={submitAuction}>
          <label className="grid gap-1 text-purple-100">
            Amount
            <input
              min="1"
              max={item.balance.toString()}
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="rounded-none border border-indigo-400/40 bg-black/70 px-2 py-2 text-white"
            />
          </label>
          <label className="grid gap-1 text-purple-100">
            Starting Bid
            <input
              min="1"
              type="number"
              value={startingBid}
              onChange={(event) => setStartingBid(event.target.value)}
              className="rounded-none border border-indigo-400/40 bg-black/70 px-2 py-2 text-white"
            />
          </label>
          <label className="grid gap-1 text-purple-100">
            Duration
            <input
              min="1"
              type="number"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="rounded-none border border-indigo-400/40 bg-black/70 px-2 py-2 text-white"
            />
          </label>
          <PixelButton type="submit" variant="primary" disabled={isPending} fullWidth>
            {isPending ? <PixelLoader /> : 'Submit Auction'}
          </PixelButton>
        </form>
      ) : null}
    </article>
  )
}
```

- [ ] **Step 6: Update inventory grid and portfolio page wiring**

Update `src/features/portfolio/InventoryGrid.tsx` props:

```tsx
type InventoryGridProps = {
  isLoading: boolean
  items: PortfolioInventoryItem[]
  pendingItemId?: number | null
  onCreateAuction?: (values: { itemId: number; amount: number; startingBid: number; duration: number }) => void
}
```

Render slots with:

```tsx
<InventorySlot
  key={item.id}
  item={item}
  isPending={pendingItemId === item.id}
  onCreateAuction={onCreateAuction}
/>
```

Update `src/features/portfolio/PortfolioPage.tsx`:

```tsx
import { useCreateAuction } from './useCreateAuction'
```

After inventory hook:

```tsx
  const { pendingItemId, createAuction } = useCreateAuction(inventory.refresh)
```

Render `InventoryGrid`:

```tsx
<InventoryGrid
  isLoading={inventory.isLoading}
  items={inventory.items}
  pendingItemId={pendingItemId}
  onCreateAuction={(values) =>
    void createAuction({
      ...values,
      userAddress: walletState.address,
    })
  }
/>
```

- [ ] **Step 7: Run portfolio tests**

Run:

```bash
npm test -- src/features/portfolio/PortfolioPage.test.tsx src/features/portfolio/usePortfolioInventory.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit portfolio auction creation**

```bash
git add src/features/portfolio/useCreateAuction.ts src/features/portfolio/InventorySlot.tsx src/features/portfolio/InventoryGrid.tsx src/features/portfolio/PortfolioPage.tsx src/features/portfolio/PortfolioPage.test.tsx src/features/portfolio/usePortfolioInventory.ts src/features/portfolio/usePortfolioInventory.test.ts
git commit -m "feat: create auctions from portfolio items"
```

---

### Task 5: Auction Buy and Expired Close Verification

**Files:**
- Modify: `src/features/auction/AuctionCard.test.tsx`
- Modify: `src/features/auction/AuctionPage.test.tsx`
- Modify only if tests expose a gap: `src/features/auction/AuctionCard.tsx`, `src/features/auction/AuctionPage.tsx`, `src/features/auction/useAuctionActions.ts`

- [ ] **Step 1: Add AuctionCard callback tests**

Append to `src/features/auction/AuctionCard.test.tsx`:

```tsx
  it('calls onBid for active auctions', () => {
    const onBid = vi.fn()
    const onSettle = vi.fn()
    render(
      <AuctionCard
        auction={{
          id: 1,
          swordId: 7,
          owner: '0xowner',
          amount: 1,
          highestBid: 1200,
          highestBidder: '0xbidder',
          timeEnd: 2000,
          secondsLeft: 900,
          action: 'bid',
        }}
        itemName="Samurai Katana"
        itemImageUrl=""
        coinImageUrl=""
        isPending={false}
        onBid={onBid}
        onSettle={onSettle}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /bid/i }))

    expect(onBid).toHaveBeenCalledTimes(1)
    expect(onSettle).not.toHaveBeenCalled()
  })

  it('calls onSettle for expired auctions', () => {
    const onBid = vi.fn()
    const onSettle = vi.fn()
    render(
      <AuctionCard
        auction={{
          id: 1,
          swordId: 7,
          owner: '0xowner',
          amount: 1,
          highestBid: 1200,
          highestBidder: '0xbidder',
          timeEnd: 1000,
          secondsLeft: 0,
          action: 'settle',
        }}
        itemName="Samurai Katana"
        itemImageUrl=""
        coinImageUrl=""
        isPending={false}
        onBid={onBid}
        onSettle={onSettle}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /settle/i }))

    expect(onSettle).toHaveBeenCalledTimes(1)
    expect(onBid).not.toHaveBeenCalled()
  })
```

Add imports:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
```

- [ ] **Step 2: Run card tests**

Run:

```bash
npm test -- src/features/auction/AuctionCard.test.tsx
```

Expected: PASS if existing `AuctionCard` is already correctly wired; otherwise fail and update only the button action branch.

- [ ] **Step 3: Add AuctionPage action wiring test**

In `src/features/auction/AuctionPage.test.tsx`, hoist `bid` and `settle` mocks and add both a bid and settle auction in the mocked listing. Then add:

```tsx
  it('wires buy and expired close actions to auction actions', () => {
    render(<AuctionPage />)

    fireEvent.click(screen.getByRole('button', { name: /bid/i }))
    fireEvent.click(screen.getByRole('button', { name: /settle/i }))

    expect(mocks.bid).toHaveBeenCalledWith(1, 121, '0x1234')
    expect(mocks.settle).toHaveBeenCalledWith(2)
  })
```

- [ ] **Step 4: Run auction page test**

Run:

```bash
npm test -- src/features/auction/AuctionPage.test.tsx
```

Expected: PASS if current `AuctionPage` already calls `bid(auction.id, auction.highestBid + 1, walletState.address)` and `settle(auction.id)`; otherwise update only those callbacks.

- [ ] **Step 5: Commit auction buy/close verification**

```bash
git add src/features/auction/AuctionCard.test.tsx src/features/auction/AuctionPage.test.tsx src/features/auction/AuctionCard.tsx src/features/auction/AuctionPage.tsx src/features/auction/useAuctionActions.ts
git commit -m "test: verify auction buy and close actions"
```

---

### Task 6: Hover Glow Polish

**Files:**
- Modify: `src/features/auction/AuctionCard.tsx`
- Modify: `src/features/portfolio/InventorySlot.tsx`
- Modify: `src/features/auction/AuctionCard.test.tsx`

- [ ] **Step 1: Add hover class expectation to AuctionCard test**

Update the existing stone border test:

```tsx
expect(container.querySelector('article')).toHaveClass('pixel-stone-card')
expect(container.querySelector('article')?.className).toContain('hover:shadow-')
```

- [ ] **Step 2: Run the AuctionCard test and verify it fails if glow is absent**

Run:

```bash
npm test -- src/features/auction/AuctionCard.test.tsx
```

Expected: FAIL until `AuctionCard` includes a hover glow shadow class.

- [ ] **Step 3: Add restrained hover/focus glow**

Update the root article in `src/features/auction/AuctionCard.tsx`:

```tsx
<article className="pixel-stone-card grid gap-3 rounded-none p-4 text-white transition-shadow hover:shadow-[0_0_30px_rgba(129,140,248,0.45),0_18px_40px_rgba(0,0,0,0.28)] focus-within:shadow-[0_0_30px_rgba(129,140,248,0.45),0_18px_40px_rgba(0,0,0,0.28)]">
```

Keep the hover/focus glow already added to `InventorySlot` in Task 4.

- [ ] **Step 4: Run focused card tests**

Run:

```bash
npm test -- src/features/auction/AuctionCard.test.tsx src/features/portfolio/PortfolioPage.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit hover polish**

```bash
git add src/features/auction/AuctionCard.tsx src/features/auction/AuctionCard.test.tsx src/features/portfolio/InventorySlot.tsx
git commit -m "style: add card hover glow"
```

---

### Task 7: Final Verification

**Files:**
- No source edits unless verification exposes a direct cycle 3 regression.

- [ ] **Step 1: Run focused cycle 3 tests**

Run:

```bash
npm test -- src/config/contracts.test.ts src/features/home/HomePage.test.tsx src/features/auction/actions.test.ts src/features/auction/AuctionCard.test.tsx src/features/auction/AuctionPage.test.tsx src/features/portfolio/PortfolioPage.test.tsx src/features/portfolio/usePortfolioInventory.test.ts
```

Expected: PASS for all focused cycle 3 tests.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: PASS. A Vite chunk-size warning is acceptable if the build exits with code 0.

- [ ] **Step 4: Note known unrelated full-suite failures**

Run:

```bash
npm test -- --run
```

Expected: The focused cycle 3 tests pass. If existing IPFS/cloud-layer failures remain from pre-cycle-3 changes, record them as pre-existing and do not expand scope unless the user approves.

- [ ] **Step 5: Final status**

Report:

- commits created
- focused tests result
- lint result
- build result
- full-suite status, including any pre-existing failures
