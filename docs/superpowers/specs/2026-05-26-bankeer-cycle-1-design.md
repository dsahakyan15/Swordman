# Bankeer Frontend Cycle 1 Design

## Scope

This design covers the first frontend delivery cycle for the Bankeer dApp:

- foundation setup for React + Tailwind + ethers v6
- shared pixel-art UI primitives
- fully responsive home page
- fully functional auction page
- wallet connection to local MetaMask / Hardhat at `http://127.0.0.1:8545`
- IPFS metadata loading and memoization for ERC-1155 item assets

Out of scope for this cycle:

- `/portfolio`
- inventory and `balanceOfBatch`
- broader game dashboards or admin tooling

## Product Goals

- Present Bankeer as a responsive pixel-art fantasy auction hall.
- Connect to a local blockchain environment with predictable manual contract configuration.
- Render live auction data from `Auction` and ERC-1155 metadata from `Bankeer`.
- Keep UI and blockchain concerns separated so the later `/portfolio` cycle can reuse the same Web3 and metadata foundations.

## Technical Constraints

- Frontend stack: React, TypeScript, Tailwind CSS, ethers v6
- Wallet target: MetaMask with localhost / Hardhat RPC at `127.0.0.1:8545`
- Contract addresses and ABI imports must come only from `src/config/contracts.ts`
- ABI placeholder files must exist at:
  - `src/abi/Bankeer.json`
  - `src/abi/Auction.json`
- IPFS token metadata starts from `Bankeer.uri(id)` and returns a URI template such as `ipfs://Qm.../{id}.json`
- All images and pixel-style backgrounds must use pixelated rendering

## Information Architecture

Cycle 1 uses two routes:

- `/` — landing / hero page
- `/auction` — live auction grid

The app shell must already be structured so `/portfolio` can be added later without refactoring the routing model.

## Project Structure

Recommended file organization:

- `src/app`
  - application shell, route definitions, shared layout
- `src/components/pixel`
  - reusable UI primitives such as `PixelHeader`, `PixelButton`, `WalletConnectButton`, loader, toast pieces
- `src/config/contracts.ts`
  - exported addresses, local chain values, ABI imports
- `src/abi/Bankeer.json`
  - placeholder ABI JSON file
- `src/abi/Auction.json`
  - placeholder ABI JSON file
- `src/lib/ipfsHelper.ts`
  - IPFS URI conversion, metadata fetch, image URL normalization, in-memory memoization
- `src/lib/format.ts`
  - address shortening, timer formatting, numeric formatting
- `src/web3`
  - provider helpers, wallet integration, contract factories, normalized transaction error handling
- `src/features/home`
  - home page composition
- `src/features/auction`
  - auction page composition, cards, hooks, and action wiring

## Contract Model

### Bankeer

Frontend depends on these methods:

- `uri(uint256 id) view returns (string)`
- `balanceOf(address account, uint256 id) view returns (uint256)`
- `isApprovedForAll(address account, address operator) view returns (bool)`
- `setApprovalForAll(address operator, bool approved)`
- `getPrice(uint256 id) view returns (uint256)`

### Auction

Frontend depends on these methods:

- `nextAuctionId() view returns (uint256)`
- `AuctionList(uint256 aucId) view returns (address owner, uint256 SWORD_ID, uint256 timeEnd, uint256 amount, uint256 highestBid, address highestBidder, uint8 state)`
- `buyRequest(uint256 aucId, uint256 amount)`
- `resolveAuc(uint256 aucId)`
- `cancelAuc(uint256 aucId)` — not required for a primary UI action in this cycle, but should remain accessible in the typed contract layer if needed later

Auction `state` meanings used by the UI:

- `0` = Open
- `1` = End

If `timeEnd` has passed while `state === 0`, the auction remains visible in `/auction` and its primary action becomes `Settle` / `Resolve`. Any connected user may trigger it.

## Data Loading Design

### Auction List Fetching

Auction page loading flow:

1. Read `nextAuctionId()`
2. Build an array from `0` through `nextAuctionId - 1`
3. Fetch all `AuctionList(id)` entries with `Promise.all`
4. Filter to auctions where `state === 0`
5. Derive per-card action mode:
   - active bid mode if `state === 0` and `timeEnd` is still in the future
   - settle mode if `state === 0` and `timeEnd` is already in the past

The resulting auction list drives the UI grid directly.

### IPFS Metadata Flow

`ipfsHelper.ts` is responsible for all metadata normalization:

1. Convert `ipfs://...` URIs to a public gateway URL such as `https://ipfs.io/ipfs/...`
2. Replace `{id}` in the metadata template using the requested token ID
3. Fetch JSON metadata
4. Read the `image` field from the metadata JSON
5. Convert the `image` field from `ipfs://...` to a valid HTTP URL for `<img>`

The helper must expose resolved metadata in a normalized shape that includes at least:

- `name`
- `description` when available
- `imageUrl`
- `rawUri`

### Metadata Memoization

`ipfsHelper.ts` must perform simple in-memory caching:

- cache resolved metadata by token ID and effective metadata URI
- cache resolved image URLs
- especially avoid repeated fetches for:
  - COIN metadata at `id = 1`
  - repeated sword IDs that appear multiple times in the grid

This cache is intentionally in-memory only for cycle 1.

## Wallet and Network Design

### Contract Configuration

`src/config/contracts.ts` is the only source of truth for:

- `bankeerAddress`
- `auctionAddress`
- local chain or network constants if needed
- ABI imports from the JSON files in `src/abi`

No component, hook, or utility may hardcode contract addresses or import ABI JSON directly from other locations.

### Wallet Connection

Wallet behavior:

- connect through the injected MetaMask provider
- target the local development chain at `127.0.0.1:8545`
- expose wallet states to the UI:
  - disconnected
  - connecting
  - connected
  - wrong network

If the user is on the wrong network, the UI must show a clear action such as `Switch to Localhost 8545`.

## Transaction Design

### Approval Before Bid

Before calling `buyRequest`, the auction action layer must:

1. read `isApprovedForAll(userAddress, auctionAddress)` from `Bankeer`
2. if approval is `false`, send `setApprovalForAll(auctionAddress, true)`
3. wait for approval confirmation
4. then call `buyRequest(aucId, amount)`

### Resolve Flow

If an auction is open but expired:

- primary card action becomes `Settle`
- UI calls `resolveAuc(aucId)`

### Pending State Rules

During `approve`, `buyRequest`, or `resolveAuc`:

- the relevant card enters a pending state
- repeat clicks are blocked
- a pixel loader is shown
- the primary action is disabled until the transaction succeeds, fails, or is rejected

### Transaction Error Handling

User rejection is a first-class case:

- detect errors such as `User denied transaction signature`
- immediately clear the loader
- restore the original button state
- show a small toast such as `Transaction cancelled`

Unexpected RPC or contract errors should:

- clear pending state
- show a concise normalized error toast
- avoid leaving the page in a locked or ambiguous state

Successful transaction completion should:

- show a success toast
- refetch auction data

## Responsive Visual Design

### Global Background System

The app shell uses a shared layered pixel-art backdrop built from local assets:

- layer 1: `sky.png`
- layer 2: `clouds.png`
- layer 3: `castle.png`

The three layers sit inside the page shell with absolute positioning and negative z-index ordering behind the foreground content:

- sky: `z-[-3]`
- clouds: `z-[-2]`
- castle: `z-[-1]`

Clouds animate slowly on the horizontal axis to provide light parallax motion. The other layers remain static.

All three layers must use pixelated rendering.

Representative Tailwind mapping:

- sky:
  - `absolute inset-0 z-[-3] bg-[url('/sky.png')] bg-cover bg-center [image-rendering:pixelated]`
- clouds:
  - `absolute inset-0 z-[-2] bg-[url('/clouds.png')] bg-contain bg-center bg-no-repeat [image-rendering:pixelated]`
  - plus a darkening treatment such as `bg-black/20`
- castle:
  - `absolute inset-0 z-[-1] bg-[url('/castle.png')] bg-cover bg-center bg-bottom [image-rendering:pixelated]`

Foreground application content lives inside a `relative z-10` container.

### Pixel-Art UX Rules

- Use monospace typography.
- Keep corners square: `rounded-none`.
- Use instant hover state changes rather than soft UI animation on controls.
- Avoid heavy black OS-like framing.
- Prefer translucent dark glass panels with thin indigo / purple / sunset-accent borders.
- Use white text with light shadowing where it sits directly on the scene background.

### Header

`PixelHeader` behavior:

- transparent or dark-to-transparent gradient background
- no visible border
- white navigation labels with subtle text shadow
- bank balance or connected wallet status in the right-hand area
- burger menu on mobile
- inline nav on tablet and desktop

### Home Page

Home page layout:

- centered hero stack
- no solid hero slab behind the main copy
- hero content includes:
  - eyebrow text
  - large `BANKEER` title
  - short subtitle
  - `Enter Game` and `Connect Wallet` buttons
  - optional square placeholder slots for future featured items

Responsive behavior:

- mobile: single centered column, stacked or full-width buttons
- tablet / desktop: still centered, compact vertical composition

Hero placeholder slots remain empty dark square panels in cycle 1 until real IPFS-driven hero assets are introduced.

### Auction Page

Auction page layout:

- summary row above the grid
- responsive grid:
  - `grid-cols-1`
  - `md:grid-cols-2`
  - `lg:grid-cols-3`

Each `AuctionCard` contains:

- square centered item art slot
- item name
- countdown timer
- current bid with COIN icon
- primary action button
- secondary state chip

Card style:

- dark translucent glass panel
- thin indigo / violet border
- no loud green or yellow fills
- square item art area with pixelated rendering

## Component Design

### Shared Components

- `PixelHeader`
- `PixelButton`
- `WalletConnectButton`
- `PixelLoader`
- toast viewport and toast item components

### PixelButton Variants

Variants required in cycle 1:

- `primary`
- `secondary`
- `danger`
- `ghost`

Common styling expectations:

- dark translucent background
- thin accent border
- white text
- square corners
- strong disabled styling
- immediate hover response

### WalletConnectButton States

- idle: `Connect Wallet`
- connecting: disabled with loader
- connected: shortened wallet address
- wrong network: explicit network correction CTA

### Auction Card Contract

Expected component shape:

- `AuctionCard({ auction, itemMeta, coinMeta, actionState, onBid, onSettle })`

Where:

- `auction` contains normalized auction display data
- `itemMeta` contains resolved ERC-1155 item metadata
- `coinMeta` contains COIN metadata for icon rendering
- `actionState` captures idle / pending / error-ready state needed by the card UI
- `onBid` triggers approve-and-bid flow
- `onSettle` triggers resolve flow

### Global Toast Contract

The app shell hosts one global toast viewport:

- `PixelToastViewport()`

Toast behavior:

- desktop: stacked near the upper-right area
- mobile: top-centered or near-top full-width
- types:
  - success
  - error
  - info

Toast visual style:

- dark glass panel
- thin accent border
- monospace copy

## Loading and Fallback States

### Metadata Loading

While metadata is being fetched:

- show a square placeholder art slot
- show lightweight skeleton or placeholder text
- do not collapse card layout

### Metadata Failure

If metadata or image fetch fails:

- keep the card visible
- use a fallback square art panel
- use a fallback label such as `Unknown Item`

### Empty Auction State

If there are no open auctions:

- show a dedicated empty-state panel inside the auction page
- keep the same background system and page structure

## Separation of Concerns

UI components must not import `ethers` or contract ABIs directly.

Blockchain logic belongs in hooks and service modules, such as:

- `useWallet`
- `useAuctionListings`
- `useAuctionActions`
- `useCoinMetadata`

These hooks may depend on helpers and typed contract factories inside `src/web3`, but the UI layer only consumes normalized state and callbacks.

## Testing Expectations

Cycle 1 implementation should be validated with at least:

- route rendering checks for `/` and `/auction`
- wallet state rendering checks
- metadata helper tests for IPFS URI conversion and `{id}` replacement
- cache behavior tests for repeated metadata requests
- auction list transformation tests:
  - open auction filtering
  - expired-open auction conversion to settle mode
- transaction rejection behavior tests:
  - pending clears
  - cancel toast appears
- responsive smoke testing in browser for mobile, tablet, and desktop breakpoints

## Non-Goals for This Cycle

- `/portfolio`
- player inventory rendering
- `balanceOfBatch`
- persistent local cache or indexed storage
- advanced admin controls
- generalized animation system beyond the subtle cloud drift and necessary interaction feedback

## Implementation Readiness Notes

- Add `.superpowers/` to `.gitignore` if visual companion artifacts will remain in the workspace.
- The current workspace is not recognized as an initialized git repository, so this spec can be saved locally now but cannot be committed until repository state is fixed.
