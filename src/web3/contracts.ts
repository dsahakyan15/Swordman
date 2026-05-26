import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers'

import { LOCAL_RPC_URL, auctionConfig, bankeerConfig } from '../config/contracts'

export const readProvider = new JsonRpcProvider(LOCAL_RPC_URL)

export async function getBrowserProvider() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }

  return new BrowserProvider(window.ethereum)
}

export async function getSigner() {
  const provider = await getBrowserProvider()

  return provider.getSigner()
}

export function getReadBankeerContract() {
  return new Contract(bankeerConfig.address, bankeerConfig.abi, readProvider)
}

export function getReadAuctionContract() {
  return new Contract(auctionConfig.address, auctionConfig.abi, readProvider)
}

export async function getWriteBankeerContract() {
  const signer = await getSigner()

  return new Contract(bankeerConfig.address, bankeerConfig.abi, signer)
}

export async function getWriteAuctionContract() {
  const signer = await getSigner()

  return new Contract(auctionConfig.address, auctionConfig.abi, signer)
}
