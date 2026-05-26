import { useState } from 'react'

import { useToasts } from '../../components/pixel/ToastProvider'
import { auctionAddress } from '../../config/contracts'
import { normalizeTransactionError } from '../../lib/transactionErrors'
import { getWriteAuctionContract, getWriteBankeerContract } from '../../web3/contracts'
import {
  submitBidWithApproval,
  type AuctionBidContract,
  type BankeerApprovalContract,
} from './actions'

export function useAuctionActions(onSettled: () => void) {
  const [pendingAuctionId, setPendingAuctionId] = useState<number | null>(null)
  const { pushToast } = useToasts()

  async function bid(auctionId: number, amount: number, userAddress: string) {
    try {
      setPendingAuctionId(auctionId)
      const bankeer = (await getWriteBankeerContract()) as unknown as BankeerApprovalContract
      const auction = (await getWriteAuctionContract()) as unknown as AuctionBidContract

      await submitBidWithApproval({
        bankeer,
        auction,
        userAddress,
        auctionAddress,
        auctionId,
        amount,
      })

      pushToast('Bid submitted', 'success')
      onSettled()
    } catch (error) {
      const normalized = normalizeTransactionError(error)
      pushToast(normalized.message, normalized.kind === 'rejected' ? 'info' : 'error')
    } finally {
      setPendingAuctionId(null)
    }
  }

  async function settle(auctionId: number) {
    try {
      setPendingAuctionId(auctionId)
      const auction = await getWriteAuctionContract()
      const tx = await auction.resolveAuc(auctionId)
      await tx.wait()
      pushToast('Auction settled', 'success')
      onSettled()
    } catch (error) {
      const normalized = normalizeTransactionError(error)
      pushToast(normalized.message, normalized.kind === 'rejected' ? 'info' : 'error')
    } finally {
      setPendingAuctionId(null)
    }
  }

  return {
    pendingAuctionId,
    bid,
    settle,
  }
}
