import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AuctionCard } from './AuctionCard'

describe('AuctionCard', () => {
  it('renders the item name and primary action', () => {
    const { container } = render(
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
        onBid={vi.fn()}
        onSettle={vi.fn()}
      />,
    )

    expect(screen.getByText('Samurai Katana')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bid/i })).toBeInTheDocument()
    expect(container.querySelector('article')).toHaveClass('p-3', 'sm:p-4')
  })

  it('renders an optional secondary action', () => {
    const onSecondaryAction = vi.fn()

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
        primaryActionLabel="Cancel Auction"
        primaryActionVariant="danger"
        secondaryActionLabel="Premature Close"
        onBid={vi.fn()}
        onSettle={vi.fn()}
        onSecondaryAction={onSecondaryAction}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /premature close/i }))

    expect(onSecondaryAction).toHaveBeenCalledTimes(1)
  })
})
