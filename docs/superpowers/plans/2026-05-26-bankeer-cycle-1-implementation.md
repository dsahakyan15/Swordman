# Bankeer Cycle 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable Bankeer frontend cycle with a layered pixel-art shell, wallet connection to localhost Hardhat, IPFS-backed ERC-1155 metadata loading, and a fully functional auction page.

**Architecture:** Keep the app split into route shell, shared pixel UI primitives, isolated Web3 helpers, and feature folders for `home` and `auction`. All blockchain access flows through typed helpers and hooks; UI components only consume normalized data, callbacks, and presentational state.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, ethers v6, react-router-dom, Vitest, Testing Library, jsdom

---

## File Structure

### Create

- `docs/superpowers/specs/2026-05-26-bankeer-cycle-1-design.md`
- `docs/superpowers/plans/2026-05-26-bankeer-cycle-1-implementation.md`
- `src/abi/Bankeer.json`
- `src/abi/Auction.json`
- `src/app/AppRoutes.tsx`
- `src/app/AppShell.tsx`
- `src/app/AppRoutes.test.tsx`
- `src/components/pixel/PixelButton.tsx`
- `src/components/pixel/PixelHeader.tsx`
- `src/components/pixel/WalletConnectButton.tsx`
- `src/components/pixel/PixelLoader.tsx`
- `src/components/pixel/ToastProvider.tsx`
- `src/components/pixel/WalletConnectButton.test.tsx`
- `src/config/contracts.ts`
- `src/features/home/HomePage.tsx`
- `src/features/home/HomePage.test.tsx`
- `src/features/auction/types.ts`
- `src/features/auction/model.ts`
- `src/features/auction/model.test.ts`
- `src/features/auction/actions.ts`
- `src/features/auction/actions.test.ts`
- `src/features/auction/useAuctionListings.ts`
- `src/features/auction/useAuctionActions.ts`
- `src/features/auction/useCoinMetadata.ts`
- `src/features/auction/AuctionCard.tsx`
- `src/features/auction/AuctionPage.tsx`
- `src/features/auction/AuctionPage.test.tsx`
- `src/lib/format.ts`
- `src/lib/ipfsHelper.ts`
- `src/lib/ipfsHelper.test.ts`
- `src/lib/transactionErrors.ts`
- `src/lib/transactionErrors.test.ts`
- `src/test/setup.ts`
- `src/web3/contracts.ts`
- `src/web3/WalletProvider.tsx`
- `src/web3/useWallet.ts`
- `src/web3/window.d.ts`

### Modify

- `package.json`
- `vite.config.ts`
- `tsconfig.app.json`
- `.gitignore`
- `src/App.tsx`
- `src/index.css`
- `src/main.tsx`

### Optional Delete / Stop Importing

- `src/App.css`
- `src/assets/react.svg`
- `src/assets/vite.svg`
- `src/assets/hero.png`

These assets do not need to be deleted immediately, but they should stop being imported as soon as the app shell and feature pages replace the Vite starter screen.

### Responsibilities

- `src/App.tsx`: top-level app entry that renders the router tree only
- `src/app/AppRoutes.tsx`: route tree and shared layout nesting
- `src/app/AppShell.tsx`: layered background, header, toast viewport, route outlet
- `src/config/contracts.ts`: one source of truth for addresses, local chain constants, and ABI imports
- `src/web3/*`: provider creation, typed contract helpers, wallet state hook
- `src/web3/WalletProvider.tsx`: shared wallet context so every route sees the same wallet state
- `src/lib/ipfsHelper.ts`: ERC-1155 URI normalization, gateway conversion, metadata fetch, caching
- `src/features/home/*`: landing page UI
- `src/features/auction/*`: auction transformations, hooks, cards, page wiring
- `src/components/pixel/*`: shared visual system

## Task 1: Bootstrap Routing, Test Harness, and CSS Baseline

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `tsconfig.app.json`
- Modify: `.gitignore`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Modify: `src/index.css`
- Create: `src/app/AppRoutes.tsx`
- Create: `src/app/AppShell.tsx`
- Create: `src/app/AppRoutes.test.tsx`
- Create: `src/features/home/HomePage.tsx`
- Create: `src/features/auction/AuctionPage.tsx`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Add router and test dependencies, then add test scripts**

Run:

```bash
npm install react-router-dom
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Then update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Add the failing route test**

Create `src/app/AppRoutes.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './AppRoutes'

describe('AppRoutes', () => {
  it('renders the hero route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /bankeer/i })).toBeInTheDocument()
  })

  it('renders the auction route', () => {
    render(
      <MemoryRouter initialEntries={['/auction']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /auction house/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run:

```bash
npm test -- src/app/AppRoutes.test.tsx
```

Expected: FAIL because `AppRoutes`, `AppShell`, and the route pages do not exist yet.

- [ ] **Step 4: Implement the minimal router shell and valid Tailwind baseline**

Update `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
```

Update `tsconfig.app.json` compiler options:

```json
{
  "compilerOptions": {
    "types": ["vite/client", "vitest/globals"]
  }
}
```

Update `.gitignore`:

```gitignore
.superpowers
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

Update `src/index.css` to remove the broken `./tailwind.css` import and establish a working baseline:

```css
@import "tailwindcss";

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  background: #070b18;
  color: #ffffff;
  font-family: "Courier New", Courier, monospace;
}
```

Create `src/app/AppShell.tsx`:

```tsx
import { Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070b18] text-white">
      <div
        aria-hidden="true"
        data-testid="sky-layer"
        className="absolute inset-0 z-[-3] bg-[url('/sky.png')] bg-cover bg-center bg-no-repeat [image-rendering:pixelated]"
      />
      <div
        aria-hidden="true"
        data-testid="clouds-layer"
        className="absolute inset-0 z-[-2] bg-[url('/clouds.png')] bg-contain bg-center bg-no-repeat opacity-80 [image-rendering:pixelated]"
      />
      <div
        aria-hidden="true"
        data-testid="castle-layer"
        className="absolute inset-0 z-[-1] bg-[url('/castle.png')] bg-cover bg-center bg-no-repeat [image-rendering:pixelated]"
      />
      <main className="relative z-10 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
```

Create `src/features/home/HomePage.tsx`:

```tsx
export function HomePage() {
  return <h1>BANKEER</h1>
}
```

Create `src/features/auction/AuctionPage.tsx`:

```tsx
export function AuctionPage() {
  return <h1>Auction House</h1>
}
```

Create `src/app/AppRoutes.tsx`:

```tsx
import { Route, Routes } from 'react-router-dom'
import { AppShell } from './AppShell'
import { HomePage } from '../features/home/HomePage'
import { AuctionPage } from '../features/auction/AuctionPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/auction" element={<AuctionPage />} />
      </Route>
    </Routes>
  )
}
```

Update `src/App.tsx`:

```tsx
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './app/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
```

Update `src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 5: Run the route test to verify it passes**

Run:

```bash
npm test -- src/app/AppRoutes.test.tsx
```

Expected: PASS with 2 tests passing.

- [ ] **Step 6: Checkpoint the bootstrap changes**

Run if git is available:

```bash
git add package.json vite.config.ts tsconfig.app.json .gitignore src/App.tsx src/main.tsx src/index.css src/app/AppRoutes.tsx src/app/AppShell.tsx src/app/AppRoutes.test.tsx src/features/home/HomePage.tsx src/features/auction/AuctionPage.tsx src/test/setup.ts
git commit -m "feat: bootstrap app shell and routes"
```

Expected: commit succeeds. Current workspace note: `git` is not currently initialized correctly, so this step is blocked until repository metadata is repaired.

## Task 2: Add Manual Contract Configuration, Format Helpers, and IPFS Utilities

**Files:**
- Create: `src/abi/Bankeer.json`
- Create: `src/abi/Auction.json`
- Create: `src/config/contracts.ts`
- Create: `src/lib/format.ts`
- Create: `src/lib/ipfsHelper.ts`
- Create: `src/lib/ipfsHelper.test.ts`
- Modify: `tsconfig.app.json`

- [ ] **Step 1: Enable JSON imports and add the failing IPFS helper test**

Update `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

Create `src/lib/ipfsHelper.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchTokenMetadata, ipfsToHttp, resetIpfsCaches } from './ipfsHelper'

describe('ipfsHelper', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    resetIpfsCaches()
  })

  it('converts ipfs URIs to the public gateway', () => {
    expect(ipfsToHttp('ipfs://QmHash/file.png')).toBe('https://ipfs.io/ipfs/QmHash/file.png')
  })

  it('fetches metadata, expands {id}, and normalizes the image URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          name: 'Coin',
          description: 'Bankeer currency',
          image: 'ipfs://QmImage/coin.png',
        }),
      }),
    )

    const result = await fetchTokenMetadata('ipfs://QmMeta/{id}.json', 1)

    expect(fetch).toHaveBeenCalledWith('https://ipfs.io/ipfs/QmMeta/1.json')
    expect(result.imageUrl).toBe('https://ipfs.io/ipfs/QmImage/coin.png')
  })

  it('memoizes repeated requests for the same token metadata', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          name: 'Coin',
          image: 'ipfs://QmImage/coin.png',
        }),
      }),
    )

    await fetchTokenMetadata('ipfs://QmMeta/{id}.json', 1)
    await fetchTokenMetadata('ipfs://QmMeta/{id}.json', 1)

    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run the helper test to verify it fails**

Run:

```bash
npm test -- src/lib/ipfsHelper.test.ts
```

Expected: FAIL because `ipfsHelper.ts` does not exist yet.

- [ ] **Step 3: Implement contract config, format helpers, and IPFS memoization**

Create `src/abi/Bankeer.json`:

```json
[]
```

Create `src/abi/Auction.json`:

```json
[]
```

Create `src/config/contracts.ts`:

```ts
import bankeerAbi from '../abi/Bankeer.json'
import auctionAbi from '../abi/Auction.json'

export const LOCAL_RPC_URL = 'http://127.0.0.1:8545'
export const LOCAL_CHAIN_ID = 31337
export const LOCAL_CHAIN_ID_HEX = '0x7a69'

export const bankeerAddress = ''
export const auctionAddress = ''

export const bankeerConfig = {
  address: bankeerAddress,
  abi: bankeerAbi,
} as const

export const auctionConfig = {
  address: auctionAddress,
  abi: auctionAbi,
} as const
```

Create `src/lib/format.ts`:

```ts
export function shortenAddress(address: string, visible = 4) {
  if (!address) return ''
  return `${address.slice(0, visible + 2)}...${address.slice(-visible)}`
}

export function formatCountdown(secondsLeft: number) {
  const safe = Math.max(0, secondsLeft)
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}
```

Create `src/lib/ipfsHelper.ts`:

```ts
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'

export type TokenMetadata = {
  name: string
  description?: string
  imageUrl: string
  rawUri: string
}

const metadataCache = new Map<string, Promise<TokenMetadata>>()
const imageCache = new Map<string, string>()

export function ipfsToHttp(uri: string) {
  return uri.startsWith('ipfs://') ? uri.replace('ipfs://', IPFS_GATEWAY) : uri
}

export function expandTokenUri(template: string, tokenId: bigint | number) {
  return template.replace('{id}', String(tokenId))
}

export async function fetchTokenMetadata(uriTemplate: string, tokenId: bigint | number) {
  const resolvedUri = expandTokenUri(uriTemplate, tokenId)
  const cacheKey = `${tokenId}:${resolvedUri}`

  if (!metadataCache.has(cacheKey)) {
    metadataCache.set(
      cacheKey,
      (async () => {
        const response = await fetch(ipfsToHttp(resolvedUri))
        if (!response.ok) {
          throw new Error(`Failed to load metadata for token ${tokenId}`)
        }

        const json = (await response.json()) as { name?: string; description?: string; image?: string }
        const imageUrl = json.image ? resolveImageUrl(json.image) : ''

        return {
          name: json.name ?? `Item #${tokenId}`,
          description: json.description,
          imageUrl,
          rawUri: resolvedUri,
        }
      })(),
    )
  }

  return metadataCache.get(cacheKey)!
}

export function resolveImageUrl(uri: string) {
  if (!imageCache.has(uri)) {
    imageCache.set(uri, ipfsToHttp(uri))
  }

  return imageCache.get(uri)!
}

export function resetIpfsCaches() {
  metadataCache.clear()
  imageCache.clear()
}
```

- [ ] **Step 4: Run the helper test to verify it passes**

Run:

```bash
npm test -- src/lib/ipfsHelper.test.ts
```

Expected: PASS with 3 tests passing.

- [ ] **Step 5: Checkpoint the config and helper changes**

Run if git is available:

```bash
git add tsconfig.app.json src/abi/Bankeer.json src/abi/Auction.json src/config/contracts.ts src/lib/format.ts src/lib/ipfsHelper.ts src/lib/ipfsHelper.test.ts
git commit -m "feat: add contract config and ipfs helpers"
```

Expected: commit succeeds if git becomes available.

## Task 3: Build Web3 Helpers, Wallet State, and Transaction Error Normalization

**Files:**
- Create: `src/lib/transactionErrors.ts`
- Create: `src/lib/transactionErrors.test.ts`
- Create: `src/web3/contracts.ts`
- Create: `src/web3/WalletProvider.tsx`
- Create: `src/web3/useWallet.ts`
- Create: `src/web3/window.d.ts`
- Modify: `src/config/contracts.ts`

- [ ] **Step 1: Add the failing transaction error test**

Create `src/lib/transactionErrors.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { normalizeTransactionError } from './transactionErrors'

describe('normalizeTransactionError', () => {
  it('maps user rejection to a cancelled message', () => {
    expect(normalizeTransactionError(new Error('User denied transaction signature'))).toEqual({
      kind: 'rejected',
      message: 'Transaction cancelled',
    })
  })

  it('maps unknown failures to a generic error message', () => {
    expect(normalizeTransactionError(new Error('execution reverted'))).toEqual({
      kind: 'error',
      message: 'Transaction failed',
    })
  })
})
```

- [ ] **Step 2: Run the error normalization test to verify it fails**

Run:

```bash
npm test -- src/lib/transactionErrors.test.ts
```

Expected: FAIL because `transactionErrors.ts` does not exist.

- [ ] **Step 3: Implement typed contract factories and the wallet hook**

Create `src/lib/transactionErrors.ts`:

```ts
export type NormalizedTransactionError = {
  kind: 'rejected' | 'error'
  message: string
}

export function normalizeTransactionError(error: unknown): NormalizedTransactionError {
  const message = error instanceof Error ? error.message : String(error)

  if (/user denied|rejected/i.test(message)) {
    return {
      kind: 'rejected',
      message: 'Transaction cancelled',
    }
  }

  return {
    kind: 'error',
    message: 'Transaction failed',
  }
}
```

Create `src/web3/window.d.ts`:

```ts
import type { Eip1193Provider } from 'ethers'

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

export {}
```

Create `src/web3/contracts.ts`:

```ts
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers'
import { LOCAL_RPC_URL, auctionConfig, bankeerConfig } from '../config/contracts'

export const readProvider = new JsonRpcProvider(LOCAL_RPC_URL)

export async function getBrowserProvider() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }

  return new BrowserProvider(window.ethereum)
}

export async function getSigner() {
  const provider = await getBrowserProvider()
  return provider.getSigner()
}

export function getReadBankeerContract() {
  return new Contract(bankeerConfig.address, bankeerConfig.abi, readProvider)
}

export function getReadAuctionContract() {
  return new Contract(auctionConfig.address, auctionConfig.abi, readProvider)
}

export async function getWriteBankeerContract() {
  const signer = await getSigner()
  return new Contract(bankeerConfig.address, bankeerConfig.abi, signer)
}

export async function getWriteAuctionContract() {
  const signer = await getSigner()
  return new Contract(auctionConfig.address, auctionConfig.abi, signer)
}
```

Create `src/web3/useWallet.ts`:

```ts
export { useWallet } from './WalletProvider'
```

Create `src/web3/WalletProvider.tsx`:

```ts
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { BrowserProvider } from 'ethers'
import { LOCAL_CHAIN_ID, LOCAL_CHAIN_ID_HEX } from '../config/contracts'

export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'wrong-network'

export type WalletState = {
  address: string
  status: WalletStatus
}

const emptyWalletState: WalletState = {
  address: '',
  status: 'disconnected',
}

type WalletContextValue = {
  walletState: WalletState
  connect: () => Promise<void>
  switchToLocalhost: () => Promise<void>
  refreshWallet: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: PropsWithChildren) {
  const [walletState, setWalletState] = useState<WalletState>(emptyWalletState)

  async function syncFromProvider() {
    if (!window.ethereum) {
      setWalletState(emptyWalletState)
      return
    }

    const provider = new BrowserProvider(window.ethereum)
    const accounts = (await provider.send('eth_accounts', [])) as string[]
    const network = await provider.getNetwork()
    const status =
      Number(network.chainId) === LOCAL_CHAIN_ID
        ? accounts[0]
          ? 'connected'
          : 'disconnected'
        : 'wrong-network'

    setWalletState({
      address: accounts[0] ?? '',
      status,
    })
  }

  async function connect() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    setWalletState((current) => ({ ...current, status: 'connecting' }))

    const provider = new BrowserProvider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    await syncFromProvider()
  }

  async function switchToLocalhost() {
    if (!window.ethereum?.request) {
      throw new Error('MetaMask is not installed')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: LOCAL_CHAIN_ID_HEX }],
      })
    } catch {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: LOCAL_CHAIN_ID_HEX,
            chainName: 'Hardhat Localhost',
            rpcUrls: ['http://127.0.0.1:8545'],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ],
      })
    }

    await syncFromProvider()
  }

  useEffect(() => {
    void syncFromProvider()
  }, [])

  const value = useMemo(
    () => ({
      walletState,
      connect,
      switchToLocalhost,
      refreshWallet: syncFromProvider,
    }),
    [walletState],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)

  if (!context) {
    throw new Error('useWallet must be used inside WalletProvider')
  }

  return context
}
```

- [ ] **Step 4: Run the transaction error test to verify it passes**

Run:

```bash
npm test -- src/lib/transactionErrors.test.ts
```

Expected: PASS with 2 tests passing.

- [ ] **Step 5: Checkpoint the Web3 foundation**

Run if git is available:

```bash
git add src/lib/transactionErrors.ts src/lib/transactionErrors.test.ts src/web3/contracts.ts src/web3/WalletProvider.tsx src/web3/useWallet.ts src/web3/window.d.ts
git commit -m "feat: add wallet and web3 helpers"
```

Expected: commit succeeds if git is available.

## Task 4: Implement Shared Pixel Components, Header, Toasts, and Foreground Shell

**Files:**
- Create: `src/components/pixel/PixelButton.tsx`
- Create: `src/components/pixel/PixelHeader.tsx`
- Create: `src/components/pixel/WalletConnectButton.tsx`
- Create: `src/components/pixel/PixelLoader.tsx`
- Create: `src/components/pixel/ToastProvider.tsx`
- Create: `src/components/pixel/WalletConnectButton.test.tsx`
- Modify: `src/app/AppShell.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Add the failing WalletConnectButton test**

Create `src/components/pixel/WalletConnectButton.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WalletConnectButton } from './WalletConnectButton'

describe('WalletConnectButton', () => {
  it('renders a connect action when disconnected', () => {
    render(
      <WalletConnectButton
        walletState={{ address: '', status: 'disconnected' }}
        onConnect={vi.fn()}
        onSwitchNetwork={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
  })

  it('renders a switch action on the wrong network', () => {
    render(
      <WalletConnectButton
        walletState={{ address: '0x1234', status: 'wrong-network' }}
        onConnect={vi.fn()}
        onSwitchNetwork={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /switch to localhost 8545/i })).toBeInTheDocument()
  })

  it('calls onConnect in the disconnected state', () => {
    const onConnect = vi.fn()

    render(
      <WalletConnectButton
        walletState={{ address: '', status: 'disconnected' }}
        onConnect={onConnect}
        onSwitchNetwork={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }))
    expect(onConnect).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run the component test to verify it fails**

Run:

```bash
npm test -- src/components/pixel/WalletConnectButton.test.tsx
```

Expected: FAIL because the shared pixel components do not exist.

- [ ] **Step 3: Implement the reusable pixel UI primitives and shell**

Create `src/components/pixel/PixelButton.tsx`:

```tsx
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type PixelButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variantClasses: Record<PixelButtonVariant, string> = {
  primary: 'border-orange-400/80 hover:bg-orange-400/15',
  secondary: 'border-purple-400/80 hover:bg-purple-400/15',
  danger: 'border-pink-400/80 hover:bg-pink-400/15',
  ghost: 'border-indigo-300/60 hover:bg-white/10',
}

type PixelButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: PixelButtonVariant
    fullWidth?: boolean
  }
>

export function PixelButton({
  children,
  className = '',
  fullWidth = false,
  variant = 'secondary',
  ...props
}: PixelButtonProps) {
  return (
    <button
      className={[
        'rounded-none border bg-slate-950/60 px-4 py-3 text-sm uppercase tracking-[0.18em] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-sm transition-none disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
```

Create `src/components/pixel/PixelLoader.tsx`:

```tsx
export function PixelLoader() {
  return (
    <span
      aria-label="Loading"
      className="inline-block h-3 w-3 animate-pulse bg-orange-300 shadow-[6px_0_0_0_rgba(253,186,116,0.7),12px_0_0_0_rgba(253,186,116,0.4)]"
    />
  )
}
```

Create `src/components/pixel/WalletConnectButton.tsx`:

```tsx
import type { WalletState } from '../../web3/useWallet'
import { shortenAddress } from '../../lib/format'
import { PixelButton } from './PixelButton'
import { PixelLoader } from './PixelLoader'

type WalletConnectButtonProps = {
  walletState: WalletState
  onConnect: () => void
  onSwitchNetwork: () => void
}

export function WalletConnectButton({
  walletState,
  onConnect,
  onSwitchNetwork,
}: WalletConnectButtonProps) {
  if (walletState.status === 'connected') {
    return <PixelButton variant="ghost">{shortenAddress(walletState.address)}</PixelButton>
  }

  if (walletState.status === 'wrong-network') {
    return (
      <PixelButton variant="danger" onClick={onSwitchNetwork}>
        Switch to Localhost 8545
      </PixelButton>
    )
  }

  return (
    <PixelButton
      variant="secondary"
      onClick={onConnect}
      disabled={walletState.status === 'connecting'}
    >
      {walletState.status === 'connecting' ? <PixelLoader /> : 'Connect Wallet'}
    </PixelButton>
  )
}
```

Create `src/components/pixel/ToastProvider.tsx`:

```tsx
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

type ToastTone = 'success' | 'error' | 'info'

type ToastItem = {
  id: number
  message: string
  tone: ToastTone
}

type ToastContextValue = {
  pushToast: (message: string, tone: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  function pushToast(message: string, tone: ToastTone) {
    const id = Date.now()
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3200)
  }

  const value = useMemo(() => ({ pushToast }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 md:right-6 md:top-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-none border border-indigo-400/60 bg-slate-950/80 px-4 py-3 text-sm text-white backdrop-blur-sm"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToasts() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToasts must be used inside ToastProvider')
  }

  return context
}
```

Create `src/components/pixel/PixelHeader.tsx`:

```tsx
import { Link } from 'react-router-dom'
import type { WalletState } from '../../web3/useWallet'
import { WalletConnectButton } from './WalletConnectButton'

type PixelHeaderProps = {
  walletState: WalletState
  onConnect: () => void
  onSwitchNetwork: () => void
}

export function PixelHeader({
  walletState,
  onConnect,
  onSwitchNetwork,
}: PixelHeaderProps) {
  return (
    <header className="relative z-20 bg-gradient-to-b from-slate-950/70 to-transparent px-4 py-4 text-white md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="text-lg uppercase tracking-[0.25em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Bankeer
        </Link>
        <nav className="hidden items-center gap-4 text-sm uppercase tracking-[0.18em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] md:flex">
          <Link to="/">Home</Link>
          <Link to="/auction">Auction</Link>
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation menu"
            className="border border-white/30 bg-slate-950/40 px-3 py-2 text-white md:hidden"
          >
            Menu
          </button>
          <WalletConnectButton
            walletState={walletState}
            onConnect={onConnect}
            onSwitchNetwork={onSwitchNetwork}
          />
        </div>
      </div>
    </header>
  )
}
```

Update `src/app/AppShell.tsx`:

```tsx
import { Outlet } from 'react-router-dom'
import { PixelHeader } from '../components/pixel/PixelHeader'
import { ToastProvider } from '../components/pixel/ToastProvider'
import { WalletProvider } from '../web3/WalletProvider'
import { useWallet } from '../web3/useWallet'

export function AppShell() {
  return (
    <ToastProvider>
      <WalletProvider>
        <ShellContent />
      </WalletProvider>
    </ToastProvider>
  )
}

function ShellContent() {
  const { walletState, connect, switchToLocalhost } = useWallet()

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070b18] text-white">
      <div className="absolute inset-0 z-[-3] bg-[url('/sky.png')] bg-cover bg-center bg-no-repeat [image-rendering:pixelated]" />
      <div className="pointer-events-none absolute inset-0 z-[-2] bg-[url('/clouds.png')] bg-contain bg-center bg-no-repeat opacity-80 [image-rendering:pixelated] animate-[clouds_28s_linear_infinite]" />
      <div className="absolute inset-0 z-[-1] bg-[url('/castle.png')] bg-cover bg-center bg-no-repeat [image-rendering:pixelated]" />
      <PixelHeader
        walletState={walletState}
        onConnect={() => void connect()}
        onSwitchNetwork={() => void switchToLocalhost()}
      />
      <main className="relative z-10 min-h-[calc(100vh-72px)]">
        <Outlet />
      </main>
    </div>
  )
}
```

Update `src/index.css` with theme helpers and cloud keyframes:

```css
@import "tailwindcss";

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  background: #070b18;
  color: #ffffff;
  font-family: "Courier New", Courier, monospace;
}

@keyframes clouds {
  0% {
    transform: translateX(-3%);
  }

  50% {
    transform: translateX(3%);
  }

  100% {
    transform: translateX(-3%);
  }
}
```

- [ ] **Step 4: Run the WalletConnectButton test to verify it passes**

Run:

```bash
npm test -- src/components/pixel/WalletConnectButton.test.tsx
```

Expected: PASS with 3 tests passing.

- [ ] **Step 5: Checkpoint the shared pixel UI**

Run if git is available:

```bash
git add src/components/pixel/PixelButton.tsx src/components/pixel/PixelHeader.tsx src/components/pixel/WalletConnectButton.tsx src/components/pixel/PixelLoader.tsx src/components/pixel/ToastProvider.tsx src/components/pixel/WalletConnectButton.test.tsx src/app/AppShell.tsx src/index.css
git commit -m "feat: add shared pixel ui components"
```

Expected: commit succeeds if git is available.

## Task 5: Build the Final Home Page Hero

**Files:**
- Modify: `src/features/home/HomePage.tsx`
- Create: `src/features/home/HomePage.test.tsx`

- [ ] **Step 1: Add the failing home page test**

Create `src/features/home/HomePage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders the hero copy, actions, and placeholder slots', () => {
    render(<HomePage />)

    expect(screen.getByRole('heading', { name: /bankeer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enter game/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
    expect(screen.getAllByLabelText(/featured slot/i)).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run the home page test to verify it fails**

Run:

```bash
npm test -- src/features/home/HomePage.test.tsx
```

Expected: FAIL because `HomePage` is still a placeholder.

- [ ] **Step 3: Implement the final centered hero**

Update `src/features/home/HomePage.tsx`:

```tsx
import { PixelButton } from '../../components/pixel/PixelButton'

export function HomePage() {
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
          A fantasy auction hall rendered like modern indie pixel art: layered skies, glass panels, and local-chain bidding.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <PixelButton variant="primary" fullWidth>
            Enter Game
          </PixelButton>
          <PixelButton variant="secondary" fullWidth>
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

- [ ] **Step 4: Run the home page test to verify it passes**

Run:

```bash
npm test -- src/features/home/HomePage.test.tsx
```

Expected: PASS with 1 test passing.

- [ ] **Step 5: Checkpoint the home page**

Run if git is available:

```bash
git add src/features/home/HomePage.tsx src/features/home/HomePage.test.tsx
git commit -m "feat: build home hero page"
```

Expected: commit succeeds if git is available.

## Task 6: Implement Auction Modeling, Filtering, and Metadata Hooks

**Files:**
- Create: `src/features/auction/types.ts`
- Create: `src/features/auction/model.ts`
- Create: `src/features/auction/model.test.ts`
- Create: `src/features/auction/useAuctionListings.ts`
- Create: `src/features/auction/useCoinMetadata.ts`

- [ ] **Step 1: Add the failing auction model test**

Create `src/features/auction/model.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { toAuctionViewModel } from './model'

describe('toAuctionViewModel', () => {
  it('keeps open auctions in bid mode before expiry', () => {
    const result = toAuctionViewModel(
      {
        id: 0,
        owner: '0xowner',
        swordId: 7,
        timeEnd: 2_000,
        amount: 1,
        highestBid: 120,
        highestBidder: '0xbidder',
        state: 0,
      },
      1_000,
    )

    expect(result.action).toBe('bid')
  })

  it('turns expired open auctions into settle mode', () => {
    const result = toAuctionViewModel(
      {
        id: 1,
        owner: '0xowner',
        swordId: 9,
        timeEnd: 1_000,
        amount: 1,
        highestBid: 175,
        highestBidder: '0xbidder',
        state: 0,
      },
      1_001,
    )

    expect(result.action).toBe('settle')
  })

  it('returns null for non-open auctions', () => {
    const result = toAuctionViewModel(
      {
        id: 2,
        owner: '0xowner',
        swordId: 10,
        timeEnd: 1_000,
        amount: 1,
        highestBid: 90,
        highestBidder: '0xbidder',
        state: 1,
      },
      1_001,
    )

    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run the auction model test to verify it fails**

Run:

```bash
npm test -- src/features/auction/model.test.ts
```

Expected: FAIL because `model.ts` does not exist.

- [ ] **Step 3: Implement auction transformations and listing hooks**

Create `src/features/auction/types.ts`:

```ts
export type RawAuction = {
  id: number
  owner: string
  swordId: number
  timeEnd: number
  amount: number
  highestBid: number
  highestBidder: string
  state: number
}

export type AuctionViewModel = {
  id: number
  swordId: number
  owner: string
  amount: number
  highestBid: number
  highestBidder: string
  timeEnd: number
  secondsLeft: number
  action: 'bid' | 'settle'
}
```

Create `src/features/auction/model.ts`:

```ts
import type { AuctionViewModel, RawAuction } from './types'

export function toAuctionViewModel(raw: RawAuction, nowSeconds: number): AuctionViewModel | null {
  if (raw.state !== 0) {
    return null
  }

  const secondsLeft = Math.max(0, raw.timeEnd - nowSeconds)

  return {
    id: raw.id,
    swordId: raw.swordId,
    owner: raw.owner,
    amount: raw.amount,
    highestBid: raw.highestBid,
    highestBidder: raw.highestBidder,
    timeEnd: raw.timeEnd,
    secondsLeft,
    action: raw.timeEnd <= nowSeconds ? 'settle' : 'bid',
  }
}
```

Create `src/features/auction/useAuctionListings.ts`:

```ts
import { useEffect, useState } from 'react'
import { getReadAuctionContract } from '../../web3/contracts'
import type { AuctionViewModel, RawAuction } from './types'
import { toAuctionViewModel } from './model'

type AuctionListingsState = {
  auctions: AuctionViewModel[]
  isLoading: boolean
  error: string
}

const emptyState: AuctionListingsState = {
  auctions: [],
  isLoading: true,
  error: '',
}

export function useAuctionListings(refreshKey = 0) {
  const [state, setState] = useState<AuctionListingsState>(emptyState)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        setState((current) => ({ ...current, isLoading: true, error: '' }))
        const contract = getReadAuctionContract()
        const nextAuctionId = Number(await contract.nextAuctionId())
        const nowSeconds = Math.floor(Date.now() / 1000)

        const rawAuctions = (await Promise.all(
          Array.from({ length: nextAuctionId }, async (_, id) => {
            const entry = await contract.AuctionList(id)
            return {
              id,
              owner: entry.owner,
              swordId: Number(entry.SWORD_ID),
              timeEnd: Number(entry.timeEnd),
              amount: Number(entry.amount),
              highestBid: Number(entry.highestBid),
              highestBidder: entry.highestBidder,
              state: Number(entry.state),
            } satisfies RawAuction
          }),
        )) as RawAuction[]

        const auctions = rawAuctions
          .map((raw) => toAuctionViewModel(raw, nowSeconds))
          .filter((item): item is AuctionViewModel => item !== null)

        if (isMounted) {
          setState({
            auctions,
            isLoading: false,
            error: '',
          })
        }
      } catch (error) {
        if (isMounted) {
          setState({
            auctions: [],
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load auctions',
          })
        }
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  return state
}
```

Create `src/features/auction/useCoinMetadata.ts`:

```ts
import { useEffect, useState } from 'react'
import { getReadBankeerContract } from '../../web3/contracts'
import { fetchTokenMetadata } from '../../lib/ipfsHelper'

export function useCoinMetadata() {
  const [coinMeta, setCoinMeta] = useState<{ name: string; imageUrl: string } | null>(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      const contract = getReadBankeerContract()
      const uri = await contract.uri(1)
      const metadata = await fetchTokenMetadata(uri, 1)
      if (isMounted) {
        setCoinMeta({
          name: metadata.name,
          imageUrl: metadata.imageUrl,
        })
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [])

  return coinMeta
}
```

- [ ] **Step 4: Run the auction model test to verify it passes**

Run:

```bash
npm test -- src/features/auction/model.test.ts
```

Expected: PASS with 3 tests passing.

- [ ] **Step 5: Checkpoint the auction data modeling**

Run if git is available:

```bash
git add src/features/auction/types.ts src/features/auction/model.ts src/features/auction/model.test.ts src/features/auction/useAuctionListings.ts src/features/auction/useCoinMetadata.ts
git commit -m "feat: add auction data modeling"
```

Expected: commit succeeds if git is available.

## Task 7: Implement Approve/Bid/Settle Actions and the Auction UI

**Files:**
- Create: `src/features/auction/actions.ts`
- Create: `src/features/auction/actions.test.ts`
- Create: `src/features/auction/useAuctionActions.ts`
- Modify: `src/features/auction/AuctionPage.tsx`
- Create: `src/features/auction/AuctionCard.tsx`
- Create: `src/features/auction/AuctionPage.test.tsx`

- [ ] **Step 1: Add the failing action service test**

Create `src/features/auction/actions.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { submitBidWithApproval } from './actions'

describe('submitBidWithApproval', () => {
  it('approves before bidding when approval is missing', async () => {
    const bankeer = {
      isApprovedForAll: vi.fn().mockResolvedValue(false),
      setApprovalForAll: vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue(undefined) }),
    }

    const auction = {
      buyRequest: vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue(undefined) }),
    }

    await submitBidWithApproval({
      bankeer,
      auction,
      userAddress: '0x1234',
      auctionAddress: '0xabcd',
      auctionId: 3,
      amount: 50,
    })

    expect(bankeer.setApprovalForAll).toHaveBeenCalledWith('0xabcd', true)
    expect(auction.buyRequest).toHaveBeenCalledWith(3, 50)
  })

  it('skips approval when approval already exists', async () => {
    const bankeer = {
      isApprovedForAll: vi.fn().mockResolvedValue(true),
      setApprovalForAll: vi.fn(),
    }

    const auction = {
      buyRequest: vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue(undefined) }),
    }

    await submitBidWithApproval({
      bankeer,
      auction,
      userAddress: '0x1234',
      auctionAddress: '0xabcd',
      auctionId: 3,
      amount: 50,
    })

    expect(bankeer.setApprovalForAll).not.toHaveBeenCalled()
    expect(auction.buyRequest).toHaveBeenCalledWith(3, 50)
  })
})
```

- [ ] **Step 2: Run the action service test to verify it fails**

Run:

```bash
npm test -- src/features/auction/actions.test.ts
```

Expected: FAIL because `actions.ts` does not exist.

- [ ] **Step 3: Implement approve/bid/settle services and the auction page**

Create `src/features/auction/actions.ts`:

```ts
type SubmitBidArgs = {
  bankeer: {
    isApprovedForAll: (user: string, operator: string) => Promise<boolean>
    setApprovalForAll: (operator: string, approved: boolean) => Promise<{ wait: () => Promise<unknown> }>
  }
  auction: {
    buyRequest: (auctionId: number, amount: number) => Promise<{ wait: () => Promise<unknown> }>
    resolveAuc?: (auctionId: number) => Promise<{ wait: () => Promise<unknown> }>
  }
  userAddress: string
  auctionAddress: string
  auctionId: number
  amount: number
}

export async function submitBidWithApproval({
  bankeer,
  auction,
  userAddress,
  auctionAddress,
  auctionId,
  amount,
}: SubmitBidArgs) {
  const approved = await bankeer.isApprovedForAll(userAddress, auctionAddress)

  if (!approved) {
    const approvalTx = await bankeer.setApprovalForAll(auctionAddress, true)
    await approvalTx.wait()
  }

  const bidTx = await auction.buyRequest(auctionId, amount)
  await bidTx.wait()
}
```

Create `src/features/auction/useAuctionActions.ts`:

```ts
import { useState } from 'react'
import { auctionAddress } from '../../config/contracts'
import { normalizeTransactionError } from '../../lib/transactionErrors'
import { useToasts } from '../../components/pixel/ToastProvider'
import { getWriteAuctionContract, getWriteBankeerContract } from '../../web3/contracts'
import { submitBidWithApproval } from './actions'

export function useAuctionActions(onSettled: () => void) {
  const [pendingAuctionId, setPendingAuctionId] = useState<number | null>(null)
  const { pushToast } = useToasts()

  async function bid(auctionId: number, amount: number, userAddress: string) {
    try {
      setPendingAuctionId(auctionId)
      const bankeer = await getWriteBankeerContract()
      const auction = await getWriteAuctionContract()

      await submitBidWithApproval({
        bankeer,
        auction,
        userAddress,
        auctionAddress,
        auctionId,
        amount,
      })

      pushToast('Bid submitted', 'success')
      onSettled()
    } catch (error) {
      const normalized = normalizeTransactionError(error)
      pushToast(normalized.message, normalized.kind === 'rejected' ? 'info' : 'error')
    } finally {
      setPendingAuctionId(null)
    }
  }

  async function settle(auctionId: number) {
    try {
      setPendingAuctionId(auctionId)
      const auction = await getWriteAuctionContract()
      const tx = await auction.resolveAuc(auctionId)
      await tx.wait()
      pushToast('Auction settled', 'success')
      onSettled()
    } catch (error) {
      const normalized = normalizeTransactionError(error)
      pushToast(normalized.message, normalized.kind === 'rejected' ? 'info' : 'error')
    } finally {
      setPendingAuctionId(null)
    }
  }

  return {
    pendingAuctionId,
    bid,
    settle,
  }
}
```

Create `src/features/auction/AuctionCard.tsx`:

```tsx
import { formatCountdown } from '../../lib/format'
import { PixelButton } from '../../components/pixel/PixelButton'
import { PixelLoader } from '../../components/pixel/PixelLoader'
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
          <img src={itemImageUrl} alt={itemName} className="h-full w-full object-cover [image-rendering:pixelated]" />
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
```

Update `src/features/auction/AuctionPage.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { fetchTokenMetadata } from '../../lib/ipfsHelper'
import { useWallet } from '../../web3/useWallet'
import { getReadBankeerContract } from '../../web3/contracts'
import { AuctionCard } from './AuctionCard'
import { useAuctionListings } from './useAuctionListings'
import { useAuctionActions } from './useAuctionActions'
import { useCoinMetadata } from './useCoinMetadata'

export function AuctionPage() {
  const { walletState } = useWallet()
  const [refreshKey, setRefreshKey] = useState(0)
  const { auctions, isLoading, error } = useAuctionListings(refreshKey)
  const { pendingAuctionId, bid, settle } = useAuctionActions(() => setRefreshKey((value) => value + 1))
  const coinMeta = useCoinMetadata()

  const [metaById, setMetaById] = useState<Record<number, { name: string; imageUrl: string }>>({})

  useEffect(() => {
    void (async () => {
      const contract = getReadBankeerContract()
      const entries = await Promise.all(
        auctions.map(async (auction) => {
          const uri = await contract.uri(auction.swordId)
          const metadata = await fetchTokenMetadata(uri, auction.swordId)
          return [auction.swordId, { name: metadata.name, imageUrl: metadata.imageUrl }] as const
        }),
      )

      setMetaById(Object.fromEntries(entries))
    })()
  }, [auctions])

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="rounded-none border border-indigo-400/40 bg-slate-950/60 px-4 py-3 backdrop-blur-sm">
          Open lots: {auctions.length}
        </div>
        <div className="rounded-none border border-orange-400/40 bg-slate-950/60 px-4 py-3 backdrop-blur-sm">
          {walletState.address ? walletState.address : 'Wallet disconnected'}
        </div>
      </div>

      {isLoading ? <p>Loading auctions...</p> : null}
      {error ? <p>{error}</p> : null}
      {!isLoading && !error && auctions.length === 0 ? <p>No open auctions.</p> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {auctions.map((auction) => {
          const itemMeta = metaById[auction.swordId]
          return (
            <AuctionCard
              key={auction.id}
              auction={auction}
              itemName={itemMeta?.name ?? `Item #${auction.swordId}`}
              itemImageUrl={itemMeta?.imageUrl ?? ''}
              coinImageUrl={coinMeta?.imageUrl ?? ''}
              isPending={pendingAuctionId === auction.id}
              onBid={() => void bid(auction.id, auction.highestBid + 1, walletState.address)}
              onSettle={() => void settle(auction.id)}
            />
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run the action service test to verify it passes**

Run:

```bash
npm test -- src/features/auction/actions.test.ts
```

Expected: PASS with 2 tests passing.

- [ ] **Step 5: Add the failing auction page rendering test**

Create `src/features/auction/AuctionPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuctionPage } from './AuctionPage'

vi.mock('./useAuctionListings', () => ({
  useAuctionListings: () => ({
    auctions: [
      {
        id: 1,
        swordId: 7,
        owner: '0xowner',
        amount: 1,
        highestBid: 120,
        highestBidder: '0xbidder',
        timeEnd: 2_000,
        secondsLeft: 900,
        action: 'bid',
      },
    ],
    isLoading: false,
    error: '',
  }),
}))

vi.mock('./useAuctionActions', () => ({
  useAuctionActions: () => ({
    pendingAuctionId: null,
    bid: vi.fn(),
    settle: vi.fn(),
  }),
}))

vi.mock('./useCoinMetadata', () => ({
  useCoinMetadata: () => ({ imageUrl: '' }),
}))

vi.mock('../../web3/useWallet', () => ({
  useWallet: () => ({
    walletState: { address: '0x1234', status: 'connected' },
  }),
}))

vi.mock('../../web3/contracts', () => ({
  getReadBankeerContract: vi.fn().mockReturnValue({
    uri: vi.fn().mockResolvedValue('ipfs://QmMeta/{id}.json'),
  }),
}))

vi.mock('../../lib/ipfsHelper', () => ({
  fetchTokenMetadata: vi.fn().mockResolvedValue({
    name: 'Iron Fang',
    imageUrl: '',
    rawUri: 'ipfs://QmMeta/7.json',
  }),
}))

describe('AuctionPage', () => {
  it('renders the auction grid summary', async () => {
    render(<AuctionPage />)

    expect(screen.getByText(/open lots: 1/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run the auction page test to verify it passes**

Run:

```bash
npm test -- src/features/auction/AuctionPage.test.tsx
```

Expected: PASS with 1 test passing.

- [ ] **Step 7: Checkpoint the auction interactions**

Run if git is available:

```bash
git add src/features/auction/actions.ts src/features/auction/actions.test.ts src/features/auction/useAuctionActions.ts src/features/auction/AuctionCard.tsx src/features/auction/AuctionPage.tsx src/features/auction/AuctionPage.test.tsx
git commit -m "feat: build auction page and transaction flow"
```

Expected: commit succeeds if git is available.

## Task 8: Full Verification, Lint Cleanup, and Manual QA

**Files:**
- Modify as needed based on lint or test feedback:
  - `src/features/auction/AuctionPage.tsx`
  - `src/components/pixel/*`
  - `src/web3/useWallet.ts`
  - `src/lib/*`

- [ ] **Step 1: Run the focused test suite**

Run:

```bash
npm test -- src/app/AppRoutes.test.tsx src/lib/ipfsHelper.test.ts src/lib/transactionErrors.test.ts src/components/pixel/WalletConnectButton.test.tsx src/features/home/HomePage.test.tsx src/features/auction/model.test.ts src/features/auction/actions.test.ts src/features/auction/AuctionPage.test.tsx
```

Expected: PASS with all route, helper, UI, and auction tests passing.

- [ ] **Step 2: Run lint to catch dead imports, hooks issues, and typing mistakes**

Run:

```bash
npm run lint
```

Expected: PASS with no ESLint errors.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: PASS with Vite build artifacts emitted to `dist/`.

- [ ] **Step 4: Run the app locally and manually verify the critical flows**

Run:

```bash
npm run dev
```

Manual checks:

- home page shows the 3-layer pixel background using `sky.png`, `clouds.png`, and `castle.png`
- header stays transparent with white text and wallet control
- hero content remains centered and above the background layers
- auction page renders a responsive `1 / 2 / 3` column grid across breakpoints
- MetaMask connect works on localhost
- wrong-network CTA appears if MetaMask is not on local Hardhat
- repeated COIN metadata fetches do not spam IPFS
- approving, bidding, and settling show pending state and a toast
- rejecting a transaction clears loading state and shows `Transaction cancelled`

- [ ] **Step 5: Checkpoint the verified build**

Run if git is available:

```bash
git add package.json vite.config.ts tsconfig.app.json .gitignore src
git commit -m "feat: deliver bankeer frontend cycle 1"
```

Expected: commit succeeds if git is available.

## Self-Review Notes

- Spec coverage:
  - layered background: covered in Tasks 1 and 4
  - manual contract config and ABI placeholders: covered in Task 2
  - wallet connection and local network support: covered in Task 3
  - IPFS helper with caching: covered in Task 2
  - home page pixel UI: covered in Task 5
  - auction loading, filtering, bidding, settling: covered in Tasks 6 and 7
  - rejected transaction handling with toast reset: covered in Tasks 3 and 7
- Placeholder scan:
  - no `TBD`, `TODO`, or deferred “implement later” steps remain
- Type consistency:
  - `WalletState`, `RawAuction`, and `AuctionViewModel` naming stays consistent across tasks
