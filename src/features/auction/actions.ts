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

export type AuctionCreateContract = {
  createAuc: (
    duration: number,
    swordId: number,
    amount: number,
    startingBid: number,
  ) => Promise<{ wait: () => Promise<unknown> }>
}

export type AuctionCloseContract = {
  cancelAuc: (auctionId: number) => Promise<{ wait: () => Promise<unknown> }>
}

export type AuctionPrematureCloseContract = {
  prematureClose: (auctionId: number) => Promise<{ wait: () => Promise<unknown> }>
}

type SubmitBidArgs = {
  bankeer: BankeerApprovalContract
  auction: AuctionBidContract
  userAddress: string
  auctionAddress: string
  auctionId: number
  amount: number
}

type CreateAuctionArgs = {
  bankeer: BankeerApprovalContract
  auction: AuctionCreateContract
  userAddress: string
  auctionAddress: string
  duration: number
  swordId: number
  amount: number
  startingBid: number
}

type CloseAuctionArgs = {
  auction: AuctionCloseContract
  auctionId: number
}

type PrematureCloseAuctionArgs = {
  auction: AuctionPrematureCloseContract
  auctionId: number
}

async function ensureAuctionApproval({
  bankeer,
  userAddress,
  auctionAddress,
}: {
  bankeer: BankeerApprovalContract
  userAddress: string
  auctionAddress: string
}) {
  const approved = await bankeer.isApprovedForAll(userAddress, auctionAddress)

  if (!approved) {
    const approvalTx = await bankeer.setApprovalForAll(auctionAddress, true)
    await approvalTx.wait()
  }
}

export async function submitBidWithApproval({
  bankeer,
  auction,
  userAddress,
  auctionAddress,
  auctionId,
  amount,
}: SubmitBidArgs) {
  await ensureAuctionApproval({ bankeer, userAddress, auctionAddress })

  const bidTx = await auction.buyRequest(auctionId, amount)
  await bidTx.wait()
}

export async function createAuctionWithApproval({
  bankeer,
  auction,
  userAddress,
  auctionAddress,
  duration,
  swordId,
  amount,
  startingBid,
}: CreateAuctionArgs) {
  await ensureAuctionApproval({ bankeer, userAddress, auctionAddress })

  const createTx = await auction.createAuc(duration, swordId, amount, startingBid)
  await createTx.wait()
}

export async function closeAuction({ auction, auctionId }: CloseAuctionArgs) {
  const closeTx = await auction.cancelAuc(auctionId)
  await closeTx.wait()
}

export async function prematureCloseAuction({ auction, auctionId }: PrematureCloseAuctionArgs) {
  const closeTx = await auction.prematureClose(auctionId)
  await closeTx.wait()
}
