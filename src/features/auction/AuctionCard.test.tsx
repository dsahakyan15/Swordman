import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AuctionCard } from './AuctionCard'

describe('AuctionCard', () => {
  it('uses the pixel stone border frame', () => {
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

    expect(container.querySelector('article')).toHaveClass('pixel-stone-card')
  })
})
