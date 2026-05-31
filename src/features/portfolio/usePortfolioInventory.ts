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
  price: bigint
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

    async function loadInventory(isSilent = false) {
      try {
        if (!isSilent) {
          setState((current) => ({ ...current, isLoading: true, error: '' }))
        }

        const contract = getReadBankeerContract()
        const ids = buildPortfolioTokenIds(INVENTORY_ITEM_IDS)
        const request = buildBalanceOfBatchRequest(account, ids)
        
        // Parallel fetch for balances and prices
        const [balances, prices] = await Promise.all([
          contract.balanceOfBatch(request.accounts, request.ids) as Promise<readonly bigint[]>,
          contract.getPriceBatch(ids) as Promise<readonly bigint[]>,
        ])

        const coinUri = (await contract.uri(COIN_ID)) as string
        const coinMetadata = await fetchTokenMetadata(coinUri, COIN_ID)
        const ownedItems = toOwnedInventoryItems(ids, balances)
        
        const items = await Promise.all(
          ownedItems.map(async (item) => {
            try {
              const itemUri = (await contract.uri(item.id)) as string
              const metadata = await fetchTokenMetadata(itemUri, item.id)
              
              // Find price for this item ID
              const idIndex = ids.indexOf(item.id)
              const price = prices[idIndex] ?? 0n

              return { ...item, metadata, price }
            } catch {
              const idIndex = ids.indexOf(item.id)
              const price = prices[idIndex] ?? 0n
              return { ...item, metadata: fallbackMetadata(item.id), price }
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
          setState((current) => ({
            ...current,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load portfolio',
          }))
        }
      }
    }

    void loadInventory()
    
    const interval = setInterval(() => {
      void loadInventory(true)
    }, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [account])

  return state
}
