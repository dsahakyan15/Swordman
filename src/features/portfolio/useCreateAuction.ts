import { useState } from 'react'

import { useToasts } from '../../components/pixel/ToastProvider'
import { auctionAddress } from '../../config/contracts'
import { normalizeTransactionError } from '../../lib/transactionErrors'
import { getWriteAuctionContract, getWriteBankeerContract } from '../../web3/contracts'
import {
  createAuctionWithApproval,
  type AuctionCreateContract,
  type BankeerApprovalContract,
} from '../auction/actions'

type CreateAuctionInput = {
  itemId: number
  amount: number
  startingBid: number
  duration: number
  userAddress: string
}

export function useCreateAuction(onCreated: () => void) {
  const [pendingItemId, setPendingItemId] = useState<number | null>(null)
  const { pushToast } = useToasts()

  async function createAuction({
    itemId,
    amount,
    startingBid,
    duration,
    userAddress,
  }: CreateAuctionInput) {
    try {
      setPendingItemId(itemId)
      const bankeer = (await getWriteBankeerContract()) as unknown as BankeerApprovalContract
      const auction = (await getWriteAuctionContract()) as unknown as AuctionCreateContract

      await createAuctionWithApproval({
        bankeer,
        auction,
        userAddress,
        auctionAddress,
        duration,
        swordId: itemId,
        amount,
        startingBid,
      })

      pushToast('Auction created', 'success')
      onCreated()
    } catch (error) {
      const normalized = normalizeTransactionError(error)
      pushToast(normalized.message, normalized.kind === 'rejected' ? 'info' : 'error')
    } finally {
      setPendingItemId(null)
    }
  }

  return { pendingItemId, createAuction }
}
