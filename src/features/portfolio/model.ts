import { COIN_ID } from '../../config/contracts'

export type OwnedInventoryToken = {
  id: number
  balance: bigint
}

export function buildPortfolioTokenIds(itemIds: readonly number[]) {
  return [COIN_ID, ...itemIds]
}

export function buildBalanceOfBatchRequest(account: string, ids: readonly number[]) {
  return {
    accounts: ids.map(() => account),
    ids: [...ids],
  }
}

export function toOwnedInventoryItems(
  ids: readonly number[],
  balances: readonly bigint[],
) {
  return ids.reduce<OwnedInventoryToken[]>((items, id, index) => {
    const balance = balances[index] ?? 0n

    if (id > COIN_ID && balance > 0n) {
      items.push({ id, balance })
    }

    return items
  }, [])
}
