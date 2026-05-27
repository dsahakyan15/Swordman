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
