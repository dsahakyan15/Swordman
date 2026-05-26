/* eslint-disable react-refresh/only-export-components */

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { BrowserProvider } from 'ethers'

import { LOCAL_CHAIN_ID, LOCAL_CHAIN_ID_HEX, LOCAL_RPC_URL } from '../config/contracts'

export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'wrong-network'

export type WalletState = {
  address: string
  status: WalletStatus
}

type WalletContextValue = {
  walletState: WalletState
  connect: () => Promise<void>
  switchToLocalhost: () => Promise<void>
  refreshWallet: () => Promise<void>
}

const emptyWalletState: WalletState = {
  address: '',
  status: 'disconnected',
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: PropsWithChildren) {
  const [walletState, setWalletState] = useState<WalletState>(emptyWalletState)

  const syncFromProvider = useCallback(async () => {
    if (!window.ethereum) {
      setWalletState(emptyWalletState)
      return
    }

    const provider = new BrowserProvider(window.ethereum)
    const accounts = (await provider.send('eth_accounts', [])) as string[]
    const network = await provider.getNetwork()
    const status =
      Number(network.chainId) === LOCAL_CHAIN_ID
        ? accounts[0]
          ? 'connected'
          : 'disconnected'
        : 'wrong-network'

    setWalletState({
      address: accounts[0] ?? '',
      status,
    })
  }, [])

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    setWalletState((current) => ({ ...current, status: 'connecting' }))

    const provider = new BrowserProvider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    await syncFromProvider()
  }, [syncFromProvider])

  const switchToLocalhost = useCallback(async () => {
    if (!window.ethereum?.request) {
      throw new Error('MetaMask is not installed')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: LOCAL_CHAIN_ID_HEX }],
      })
    } catch {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: LOCAL_CHAIN_ID_HEX,
            chainName: 'Hardhat Localhost',
            rpcUrls: [LOCAL_RPC_URL],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ],
      })
    }

    await syncFromProvider()
  }, [syncFromProvider])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void syncFromProvider()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [syncFromProvider])

  const value = useMemo(
    () => ({
      walletState,
      connect,
      switchToLocalhost,
      refreshWallet: syncFromProvider,
    }),
    [walletState, connect, switchToLocalhost, syncFromProvider],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)

  if (!context) {
    throw new Error('useWallet must be used inside WalletProvider')
  }

  return context
}
