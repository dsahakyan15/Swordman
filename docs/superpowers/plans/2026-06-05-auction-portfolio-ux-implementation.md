# Auction Portfolio UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build adaptive auction creation and bidding workflows with contextual portfolio actions, live auction countdowns, owner close actions, and a 404 page.

**Architecture:** Keep contract calls in existing hooks and action helpers. Move form-heavy UI into focused modal components, keep inventory cards stable, and derive live countdown display from `timeEnd` plus local time instead of increasing contract polling.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, Tailwind CSS, ethers contracts, react-icons.

---

## File Structure

- Modify `src/lib/format.ts`: add small date/duration helpers if needed, keep `formatCompactNumber` as the shared price formatter.
- Modify `src/features/portfolio/PortfolioPage.tsx`: compact-format COIN balance, manage selected item and create modal state.
- Modify `src/features/portfolio/InventoryGrid.tsx`: render stable inventory cards and contextual action panel for the selected item.
- Modify `src/features/portfolio/InventorySlot.tsx`: remove inline form, expose item selection, keep item price formatting.
- Create `src/features/portfolio/CreateAuctionModal.tsx`: adaptive pixel modal with amount, starting bid, datetime ending input, minimum bid validation.
- Modify `src/features/portfolio/PortfolioPage.test.tsx`: cover compact balance, contextual menu, modal submit, and minimum bid validation.
- Modify `src/features/auction/actions.ts`: add typed close-auction helper using `cancelAuc`.
- Modify `src/features/auction/actions.test.ts`: cover `closeAuction`.
- Modify `src/features/auction/useAuctionActions.ts`: expose `closeAuction`, keep bid and settle flows.
- Modify `src/features/auction/AuctionCard.tsx`: support bid, close, and settle action labels.
- Create `src/features/auction/BidModal.tsx`: adaptive pixel modal for entered bid amount.
- Modify `src/features/auction/AuctionPage.tsx`: derive one-second local countdowns, owner detection, bid modal state, close action.
- Modify `src/features/auction/AuctionPage.test.tsx`: cover live countdown, owner close, and bid modal submit.
- Modify `src/features/auction/AuctionCard.test.tsx`: update card expectations to current classes and owner/non-owner actions.
- Create `src/features/not-found/NotFoundPage.tsx`: pixel-styled 404 page.
- Modify `src/app/AppRoutes.tsx`: add wildcard 404 route.
- Modify `src/app/AppRoutes.test.tsx`: cover unknown path.

## Tasks

### Task 1: Portfolio Contextual Create-Auction UX

**Files:**
- Modify: `src/features/portfolio/InventorySlot.tsx`
- Modify: `src/features/portfolio/InventoryGrid.tsx`
- Modify: `src/features/portfolio/PortfolioPage.tsx`
- Create: `src/features/portfolio/CreateAuctionModal.tsx`
- Test: `src/features/portfolio/PortfolioPage.test.tsx`

- [ ] **Step 1: Write failing portfolio tests**

Add tests that:
- expect portfolio balance `1200n` to render as `1.2K COIN`;
- click the inventory item `Iron Fang`;
- expect `Create Auction` in the contextual action panel;
- click `Create Auction`;
- submit amount `2`, starting bid `25`, and an end time one hour in the future;
- expect `createAuction` called with duration near `3600`;
- enter an invalid bid below `amount * price / 2` and expect no contract submit.

Run: `npm test -- src/features/portfolio/PortfolioPage.test.tsx`
Expected: FAIL because the menu/modal behavior does not exist yet.

- [ ] **Step 2: Implement `CreateAuctionModal`**

Create a controlled modal that accepts:

```ts
type CreateAuctionModalProps = {
  item: PortfolioInventoryItem | null
  isOpen: boolean
  isPending: boolean
  onClose: () => void
  onSubmit: (values: CreateAuctionValues) => void
}
```

Use `datetime-local` for ending time, min now, max one year from now. Compute:

```ts
const minimumStartingBid = Math.ceil((Number(item.price) * parsedAmount) / 2)
```

Reject invalid values with inline error text and call `onSubmit` only after validation.

- [ ] **Step 3: Refactor inventory selection**

Remove the inline form and header auction icon from `InventorySlot`. Add `onSelect`, `isSelected`, and keyboard access. In `InventoryGrid`, render an adjacent action panel for selected items with `FaBalanceScaleRight` and `Create Auction`. Use responsive classes so desktop places the panel beside the card and mobile places it below.

- [ ] **Step 4: Wire portfolio page**

Manage:

```ts
const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
const [auctionItem, setAuctionItem] = useState<PortfolioInventoryItem | null>(null)
```

Pass selection handlers to `InventoryGrid`, open `CreateAuctionModal` from the action panel, and format `inventory.coinBalance` with `formatCompactNumber`.

- [ ] **Step 5: Verify portfolio task**

Run: `npm test -- src/features/portfolio/PortfolioPage.test.tsx`
Expected: PASS.

### Task 2: Auction Contract Close Action

**Files:**
- Modify: `src/features/auction/actions.ts`
- Modify: `src/features/auction/actions.test.ts`
- Modify: `src/features/auction/useAuctionActions.ts`

- [ ] **Step 1: Write failing close-action test**

Add:

```ts
it('closes an auction through cancelAuc', async () => {
  const auction = {
    cancelAuc: vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue(undefined) }),
  }

  await closeAuction({ auction, auctionId: 5 })

  expect(auction.cancelAuc).toHaveBeenCalledWith(5)
})
```

Run: `npm test -- src/features/auction/actions.test.ts`
Expected: FAIL because `closeAuction` does not exist.

- [ ] **Step 2: Implement close helper**

Add `AuctionCloseContract` and `closeAuction({ auction, auctionId })`, calling `cancelAuc` and awaiting `wait()`.

- [ ] **Step 3: Wire hook**

In `useAuctionActions`, expose `closeAuction(auctionId)` that gets `getWriteAuctionContract()`, calls the helper, shows `Auction closed`, refreshes, and clears pending state.

- [ ] **Step 4: Verify contract action task**

Run: `npm test -- src/features/auction/actions.test.ts`
Expected: PASS.

### Task 3: Auction Cards, Bid Modal, and Live Countdown

**Files:**
- Modify: `src/features/auction/AuctionCard.tsx`
- Create: `src/features/auction/BidModal.tsx`
- Modify: `src/features/auction/AuctionPage.tsx`
- Modify: `src/features/auction/AuctionPage.test.tsx`
- Modify: `src/features/auction/AuctionCard.test.tsx`

- [ ] **Step 1: Write failing auction page tests**

Add tests that:
- render an auction owned by the connected wallet and expect `Close Auction`;
- click `Close Auction` and expect `closeAuction(auction.id)`;
- render a non-owner auction and click `Bid`;
- expect a bid modal, enter `130`, submit, and expect `bid(auction.id, 130, walletAddress)`;
- use fake timers to advance one second and expect countdown text to change locally.

Run: `npm test -- src/features/auction/AuctionPage.test.tsx src/features/auction/AuctionCard.test.tsx`
Expected: FAIL because close action, bid modal, and live countdown are not wired.

- [ ] **Step 2: Implement `BidModal`**

Create a modal with current highest bid, numeric bid input defaulting to `highestBid + 1`, inline validation for `amount > highestBid`, cancel, and submit controls.

- [ ] **Step 3: Update `AuctionCard`**

Accept `actionLabel`, `actionVariant`, and `onPrimaryAction`, or equivalent explicit props for bid/close/settle. Render `Close Auction` for owner active auctions, `Bid` for non-owner active auctions, and `Settle` for expired auctions.

- [ ] **Step 4: Derive local countdown in `AuctionPage`**

Add:

```ts
const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000))
useEffect(() => {
  const interval = window.setInterval(() => {
    setNowSeconds(Math.floor(Date.now() / 1000))
  }, 1000)
  return () => window.clearInterval(interval)
}, [])
```

Map auctions to display auctions with `secondsLeft = Math.max(0, auction.timeEnd - nowSeconds)` and `action = auction.timeEnd <= nowSeconds ? 'settle' : 'bid'`.

- [ ] **Step 5: Wire owner close and bid modal**

Compare wallet and owner lowercased. For active owner auctions call `closeAuction(auction.id)`. For active non-owner auctions open `BidModal`; submitting calls `bid(auction.id, amount, walletState.address)`.

- [ ] **Step 6: Verify auction UX task**

Run: `npm test -- src/features/auction/AuctionPage.test.tsx src/features/auction/AuctionCard.test.tsx`
Expected: PASS.

### Task 4: 404 Route

**Files:**
- Create: `src/features/not-found/NotFoundPage.tsx`
- Modify: `src/app/AppRoutes.tsx`
- Modify: `src/app/AppRoutes.test.tsx`

- [ ] **Step 1: Write failing route test**

Add an AppRoutes test for `/missing-route` expecting heading `404`.

Run: `npm test -- src/app/AppRoutes.test.tsx`
Expected: FAIL because wildcard route does not exist.

- [ ] **Step 2: Implement page and route**

Create a pixel-styled `NotFoundPage` with heading `404`, short copy, and a `PixelButton` inside a `Link` to `/`. Add `<Route path="*" element={<NotFoundPage />} />`.

- [ ] **Step 3: Verify route task**

Run: `npm test -- src/app/AppRoutes.test.tsx`
Expected: PASS.

### Task 5: Full Verification

**Files:**
- Verify all touched files.

- [ ] **Step 1: Run focused tests**

Run:

```bash
npm test -- src/features/portfolio/PortfolioPage.test.tsx src/features/auction/actions.test.ts src/features/auction/AuctionPage.test.tsx src/features/auction/AuctionCard.test.tsx src/app/AppRoutes.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Start dev server for review**

Run: `npm run dev -- --host 127.0.0.1`
Expected: Vite prints a local URL.

---

## Self-Review

- Spec coverage: portfolio compact balance, contextual menu, create modal, one-year end input, minimum bid by amount, live countdown, owner close action, bid modal, and 404 are all mapped to tasks.
- Placeholder scan: no TODO/TBD placeholders are present.
- Type consistency: `CreateAuctionValues`, `PortfolioInventoryItem`, `AuctionViewModel`, `closeAuction`, and modal prop names are used consistently across tasks.
