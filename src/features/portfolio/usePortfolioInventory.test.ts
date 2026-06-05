import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { COIN_ID, INVENTORY_ITEM_IDS } from '../../config/contracts'
import { usePortfolioInventory } from './usePortfolioInventory'

const mocks = vi.hoisted(() => ({
  balanceOfBatch: vi.fn(),
  getPriceBatch: vi.fn(),
  uri: vi.fn(),
  fetchTokenMetadata: vi.fn(),
}))

vi.mock('../../web3/contracts', () => ({
  getReadBankeerContract: () => ({
    balanceOfBatch: mocks.balanceOfBatch,
    getPriceBatch: mocks.getPriceBatch,
    uri: mocks.uri,
  }),
}))

vi.mock('../../lib/ipfsHelper', () => ({
  fetchTokenMetadata: mocks.fetchTokenMetadata,
}))

describe('usePortfolioInventory', () => {
  it('loads COIN balance and metadata for owned inventory items', async () => {
    const account = '0xabc'
    const tokenIds = [COIN_ID, ...INVENTORY_ITEM_IDS]
    mocks.balanceOfBatch.mockResolvedValue([100n, 0n, 2n, 0n, 5n])
    mocks.getPriceBatch.mockResolvedValue([1n, 10n, 20n, 30n, 40n])
    mocks.uri.mockImplementation(async (id: number) => `ipfs://QmMeta/${id}/{id}.json`)
    mocks.fetchTokenMetadata.mockImplementation(async (_uri: string, id: number) => ({
      name: id === COIN_ID ? 'COIN' : `Sword ${id}`,
      imageUrl: `https://ipfs.io/ipfs/${id}.png`,
      rawUri: `ipfs://QmMeta/${id}/{id}.json`,
    }))

    const { result } = renderHook(() => usePortfolioInventory(account))

    await waitFor(() => expect(result.current.coinBalance).toBe(100n))

    expect(mocks.balanceOfBatch).toHaveBeenCalledWith(
      tokenIds.map(() => account),
      tokenIds,
    )
    expect(result.current.coinBalance).toBe(100n)
    expect(result.current.coinMetadata?.name).toBe('COIN')
    expect(result.current.items).toEqual([
      expect.objectContaining({ id: 3, balance: 2n }),
      expect.objectContaining({ id: 5, balance: 5n }),
    ])
  })
})
