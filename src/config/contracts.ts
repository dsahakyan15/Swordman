import auctionAbi from '../abi/Auction.json'
import bankeerAbi from '../abi/Bankeer.json'

export const LOCAL_RPC_URL = 'http://127.0.0.1:8545'
export const LOCAL_CHAIN_ID = 31337
export const LOCAL_CHAIN_ID_HEX = '0x7a69'
export const COIN_ID = 1
export const INVENTORY_ITEM_IDS = [2, 3, 4, 5] as const

export const bankeerAddress = ''
export const auctionAddress = ''

export const bankeerConfig = {
  address: bankeerAddress,
  abi: bankeerAbi,
} as const

export const auctionConfig = {
  address: auctionAddress,
  abi: auctionAbi,
} as const
