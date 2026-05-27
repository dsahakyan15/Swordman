# Bankeer Cycle 3 Auction Controls Design

## Goal

Cycle 3 adds only the requested interaction polish and auction creation flow:

- configurable contract addresses with localhost fallbacks
- working home page buttons
- portfolio item auction creation for owned items
- hover glow on auction and inventory cards

No new pages, route guards, marketplace filters, auction cancellation UI, or unrelated visual redesigns are included.

## Contract Configuration

`src/config/contracts.ts` will keep the current localhost contract addresses as fallbacks, but read deployed addresses from Vite environment variables first:

- `VITE_BANKEER_ADDRESS`
- `VITE_AUCTION_ADDRESS`

This keeps local development working while allowing the same frontend build to point at different contract deployments without editing source code.

## Home Page Buttons

The home page will use existing app behavior:

- `Enter Game` navigates to `/auction`.
- `Connect Wallet` calls the existing wallet `connect()` action.

The button styling remains based on `PixelButton`; no new home sections are added.

## Portfolio Auction Creation

Each owned inventory card on `/portfolio` gets an icon-only auction button:

- icon: `FaBalanceScaleRight` from `react-icons/fa`
- title: `Create Auction`
- gold-toned border
- no visible `Create Auction` text

Clicking the icon expands a compact form on that card with:

- `amount`
- `startingBid`
- `duration`

Submitting the form will:

1. read `isApprovedForAll(walletAddress, auctionAddress)` from `Bankeer`
2. call `setApprovalForAll(auctionAddress, true)` if approval is missing
3. call `Auction.createAuc(duration, item.id, amount, startingBid)`
4. wait for the transaction
5. show the existing toast success/error feedback
6. refresh the portfolio inventory after success

The form is local to the selected card. If transaction submission fails or the user rejects the wallet prompt, the existing transaction error normalization behavior is reused.

## Hover Glow

Auction and inventory cards receive a restrained hover/focus glow:

- applies to existing `AuctionCard` and `InventorySlot`
- uses CSS classes only
- does not change card layout or add new decorative elements

## Testing

Focused tests will cover:

- env address fallback behavior in contract config
- home buttons navigate/connect
- auction creation calls approval before `createAuc` when required
- inventory card exposes the icon button with `title="Create Auction"`

Existing tests remain in place. Cycle 3 does not address unrelated current failures unless they block the new focused test run.
