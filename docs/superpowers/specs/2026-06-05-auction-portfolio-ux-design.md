# Auction and Portfolio UX Design

## Context

The portfolio page already loads owned ERC-1155 inventory items, their balances, token metadata, and item prices. Inventory items currently render a create-auction icon button inside each card and expand an inline form below the item details. The auction page already polls the auction contract every 10 seconds, renders open auctions, submits bids through `buyRequest`, and resolves expired auctions through `resolveAuc`.

This change keeps the existing contract flow and pixel-art visual language, but replaces inline forms with adaptive modal workflows and contextual action menus.

## Requirements

- Show portfolio coin balance using the same compact formatting logic already used for item prices.
- Keep item card dimensions stable when creating an auction.
- Move the create-auction control out of the item card header.
- When a user clicks an inventory item, open a contextual action menu with an icon and `Create Auction` label.
- Position the action menu adaptively:
  - Desktop and tablet: place it beside the selected card, choosing left or right based on available screen space.
  - Mobile: place it below the selected card.
  - Animate open and close with a short slide/fade transition.
- Clicking `Create Auction` opens an adaptive pixel-art modal instead of expanding the card.
- The create-auction modal must collect amount, starting bid, and auction ending time.
- The auction ending time input must support values up to one year from the current time.
- The contract still receives duration in seconds.
- The minimum starting bid for one unit cannot be below half the item price.
- For multi-unit auctions, minimum starting bid is `amount * item.price / 2`.
- Show the computed minimum starting bid using the existing compact price formatter.
- On the auction page, update displayed remaining time locally every second so users do not wait for the 10-second polling refresh.
- Add a 404 route and page in the existing pixel-art style.
- On auction cards, if the connected wallet is the auction creator, show `Close Auction` instead of `Bid`.
- `Close Auction` calls the auction contract `cancelAuc(auction.id)`.
- If the connected wallet is not the creator, `Bid` opens an adaptive pixel-art bid modal.
- The bid modal lets the user enter a bid amount from their funds and submits it through the existing bid flow.

## Chosen UX Approach

Use an inline contextual side action panel for inventory items.

The item card remains a card-only visual element. Clicking it selects the item and opens a separate action panel. The panel is rendered adjacent to the selected card on larger screens and below the card on mobile. It contains a balance-scale icon and `Create Auction` text. This preserves the requested left/right menu behavior while avoiding layout growth inside the card.

The create-auction and bid interactions use modal dialogs. Modals are better for form-heavy interactions because they provide a focused surface for validation, pending states, and error copy without stretching cards or shifting the grid.

## Portfolio Changes

### Balance Formatting

The portfolio COIN balance will use `formatCompactNumber`, matching the existing item price display. The raw full value can remain available through `title` for precision.

### Inventory Selection

`InventoryGrid` will track the selected item or receive selection state from `PortfolioPage`. The selected item will render an action menu near its card. The card click target will be keyboard-accessible, using a button-like interaction or focusable card control.

The existing icon-only auction button will be removed from the item header. The action menu button will be the only create-auction entry point.

### Create Auction Modal

The create modal will receive the selected item, pending state, and submit callback. It will render:

- Item name and compact item price.
- `Amount` numeric input, min `1`, max owned balance.
- `Starting bid` numeric input.
- `Ends at` `datetime-local` input, min current time, max one year from current time.
- Computed minimum bid summary.
- Submit and cancel controls.

On submit:

1. Parse amount and starting bid as numbers.
2. Parse ending time from the local datetime input.
3. Convert ending time to duration seconds: `Math.floor((endsAtMs - Date.now()) / 1000)`.
4. Reject values below 1 second and above one year.
5. Compute `minimumStartingBid = Math.ceil((amount * Number(item.price)) / 2)`.
6. Reject `startingBid < minimumStartingBid`.
7. Submit `itemId`, `amount`, `startingBid`, and `duration` through the existing `useCreateAuction` path.

The modal stays open and disables submit controls while the transaction is pending. It closes only after the create-auction transaction succeeds. Transaction errors continue to be shown through existing toast handling, and the modal remains open so the user can retry or cancel.

## Auction Page Changes

### Local Countdown

`useAuctionListings` can keep polling every 10 seconds for contract state. The UI will derive live countdown values locally from each auction `timeEnd` and a one-second `nowSeconds` state in `AuctionPage`, or through a small hook. This avoids contract reads every second while keeping countdown text live.

Expired auctions should switch visually from bid mode to settle mode as soon as local time reaches `timeEnd`.

### Creator Close Action

For each auction, compare the connected wallet address and `auction.owner` case-insensitively.

If the connected wallet owns the auction and the auction has not expired, the primary card action is `Close Auction`. It calls `cancelAuc(auction.id)` through `useAuctionActions`, then refreshes listings.

If the connected wallet owns an expired auction, keep the existing settle path available because the contract already exposes `resolveAuc`.

### Bid Modal

For non-owner users, `Bid` opens a modal instead of immediately sending `highestBid + 1`.

The bid modal will render:

- Item name and current highest bid.
- Bid amount numeric input.
- Minimum bid hint, defaulting to `highestBid + 1`.
- Submit and cancel controls.

On submit, the modal calls the existing bid action with the entered amount and connected wallet address. The UI validates that the bid is greater than the current highest bid before submitting. Contract-level errors still flow through existing toast normalization.

If the auction page has the connected user's COIN balance available, the modal may display it as a hint, but the required local validation is the minimum bid rule. The smart contract remains the source of truth for whether the user has enough funds.

## 404 Page

Add a `NotFoundPage` and a wildcard route under `AppShell`. The page uses the existing pixel-art background and `PixelButton` style. It shows a concise `404` title, a short message, and navigation back to home.

## Components and Boundaries

- `InventorySlot`: render stable item card, expose item click/select behavior, remove inline auction form.
- `InventoryGrid`: support selected item state and render contextual action panel.
- `CreateAuctionModal`: new focused create-auction form component.
- `AuctionCard`: support owner close action, non-owner bid modal entry, and live action labels.
- `BidModal`: new focused bid form component.
- `useAuctionActions`: add `closeAuction` using `cancelAuc`.
- `AuctionPage`: maintain one-second local time state and pass derived auction state to cards.
- `AppRoutes`: add wildcard route to `NotFoundPage`.

## Error Handling

Validation errors in modals stay local to the form and prevent contract calls. Transaction failures continue to use `normalizeTransactionError` and toasts.

Wallet-disconnected states should not send contract actions. Existing connected-wallet assumptions should remain guarded where actions require `walletState.address`.

## Testing

Update focused tests for:

- Portfolio balance uses compact formatting.
- Selecting an inventory item opens the contextual action menu.
- Create-auction modal submits duration seconds and validates minimum starting bid.
- Auction creator sees `Close Auction` and triggers `cancelAuc`.
- Non-owner `Bid` opens a modal and submits the entered amount.
- Local auction countdown updates without waiting for polling.
- Unknown routes render the 404 page.
