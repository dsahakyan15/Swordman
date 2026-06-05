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
export const LOCAL_BANKEER_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
export const LOCAL_AUCTION_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

function resolveEnvValue(value: string | undefined, fallback: string) {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : fallback
}

export const rpcUrl = resolveEnvValue(import.meta.env.VITE_RPC_URL, 'http://127.0.0.1:8545')
export const bankeerAddress = resolveEnvValue(
  import.meta.env.VITE_BANKEER_ADDRESS,
  LOCAL_BANKEER_ADDRESS,
)
export const auctionAddress = resolveEnvValue(
  import.meta.env.VITE_AUCTION_ADDRESS,
  LOCAL_AUCTION_ADDRESS,
)

export const bankeerConfig = {
  address: bankeerAddress,
  abi: resolveAbi(bankeerAbi),
} as const

export const auctionConfig = {
  address: auctionAddress,
  abi: resolveAbi(auctionAbi),
} as const
