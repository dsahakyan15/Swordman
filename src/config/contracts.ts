import type { InterfaceAbi } from 'ethers'

import auctionAbi from '../abi/Auction.json'
import bankeerAbi from '../abi/Bankeer.json'

type ImportedContractAbi = Exclude<InterfaceAbi, string>
type ContractArtifact = {
  abi: ImportedContractAbi
}
type ContractJson = ImportedContractAbi | ContractArtifact

function resolveAbi(contractJson: ContractJson) {
  return 'abi' in contractJson ? contractJson.abi : contractJson
}

export const LOCAL_CHAIN_ID = 31337
export const LOCAL_CHAIN_ID_HEX = '0x7a69'
export const COIN_ID = 1
export const INVENTORY_ITEM_IDS = [2, 3, 4, 5] as const

export const rpcUrl = import.meta.env.VITE_RPC_URL as string
export const bankeerAddress = import.meta.env.VITE_BANKEER_ADDRESS as string
export const auctionAddress = import.meta.env.VITE_AUCTION_ADDRESS as string

export const bankeerConfig = {
  address: bankeerAddress,
  abi: resolveAbi(bankeerAbi),
} as const

export const auctionConfig = {
  address: auctionAddress,
  abi: resolveAbi(auctionAbi),
} as const
