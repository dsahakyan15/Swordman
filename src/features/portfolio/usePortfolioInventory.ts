import { useEffect, useState } from 'react'

import { COIN_ID, INVENTORY_ITEM_IDS } from '../../config/contracts'
import { fetchTokenMetadata, type TokenMetadata } from '../../lib/ipfsHelper'
import { getReadBankeerContract } from '../../web3/contracts'
import {
  buildBalanceOfBatchRequest,
  buildPortfolioTokenIds,
  toOwnedInventoryItems,
  type OwnedInventoryToken,
} from './model'

export type PortfolioInventoryItem = OwnedInventoryToken & {
  metadata: TokenMetadata
}

export type PortfolioInventoryState = {
  isLoading: boolean
  error: string
  coinBalance: bigint
  coinMetadata: TokenMetadata | null
  items: PortfolioInventoryItem[]
}

const initialState: PortfolioInventoryState = {
  isLoading: false,
  error: '',
  coinBalance: 0n,
  coinMetadata: null,
  items: [],
}

function fallbackMetadata(tokenId: number): TokenMetadata {
  return {
    name: `Item #${tokenId}`,
    imageUrl: '',
    rawUri: '',
  }
}

export function usePortfolioInventory(account: string) {
  const [state, setState] = useState<PortfolioInventoryState>(initialState)

  useEffect(() => {
    if (!account) {
      return
    }

    let isMounted = true

    async function loadInventory() {
      try {
        setState((current) => ({ ...current, isLoading: true, error: '' }))

        const contract = getReadBankeerContract()
        const ids = buildPortfolioTokenIds(INVENTORY_ITEM_IDS)
        const request = buildBalanceOfBatchRequest(account, ids)
        const balances = (await contract.balanceOfBatch(
          request.accounts,
          request.ids,
        )) as readonly bigint[]
        const coinUri = (await contract.uri(COIN_ID)) as string
        const coinMetadata = await fetchTokenMetadata(coinUri, COIN_ID)
        const ownedItems = toOwnedInventoryItems(ids, balances)
        const items = await Promise.all(
          ownedItems.map(async (item) => {
            try {
              const itemUri = (await contract.uri(item.id)) as string
              const metadata = await fetchTokenMetadata(itemUri, item.id)

              return { ...item, metadata }
            } catch {
              return { ...item, metadata: fallbackMetadata(item.id) }
            }
          }),
        )

        if (isMounted) {
          setState({
            isLoading: false,
            error: '',
            coinBalance: balances[0] ?? 0n,
            coinMetadata,
            items,
          })
        }
      } catch (error) {
        if (isMounted) {
          setState({
            ...initialState,
            error: error instanceof Error ? error.message : 'Failed to load portfolio',
          })
        }
      }
    }

    void loadInventory()

    return () => {
      isMounted = false
    }
  }, [account])

  return state
}
