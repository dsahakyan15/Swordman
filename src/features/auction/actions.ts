export type BankeerApprovalContract = {
  isApprovedForAll: (user: string, operator: string) => Promise<boolean>
  setApprovalForAll: (
    operator: string,
    approved: boolean,
  ) => Promise<{ wait: () => Promise<unknown> }>
}

export type AuctionBidContract = {
  buyRequest: (
    auctionId: number,
    amount: number,
  ) => Promise<{ wait: () => Promise<unknown> }>
}

type SubmitBidArgs = {
  bankeer: BankeerApprovalContract
  auction: AuctionBidContract
  userAddress: string
  auctionAddress: string
  auctionId: number
  amount: number
}

export async function submitBidWithApproval({
  bankeer,
  auction,
  userAddress,
  auctionAddress,
  auctionId,
  amount,
}: SubmitBidArgs) {
  const approved = await bankeer.isApprovedForAll(userAddress, auctionAddress)

  if (!approved) {
    const approvalTx = await bankeer.setApprovalForAll(auctionAddress, true)
    await approvalTx.wait()
  }

  const bidTx = await auction.buyRequest(auctionId, amount)
  await bidTx.wait()
}
