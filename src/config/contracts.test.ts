import { describe, expect, it } from 'vitest'

import {
  LOCAL_AUCTION_ADDRESS,
  LOCAL_BANKEER_ADDRESS,
  auctionAddress,
  auctionConfig,
  bankeerAddress,
  bankeerConfig,
} from './contracts'

describe('contract configs', () => {
  it('exposes ABI arrays from imported contract artifacts', () => {
    expect(Array.isArray(bankeerConfig.abi)).toBe(true)
    expect(Array.isArray(auctionConfig.abi)).toBe(true)
  })

  it('exposes local contract address fallbacks', () => {
    expect(LOCAL_BANKEER_ADDRESS).toBe('0x5FbDB2315678afecb367f032d93F642f64180aa3')
    expect(LOCAL_AUCTION_ADDRESS).toBe('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')
  })

  it('uses valid contract addresses', () => {
    expect(bankeerAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
    expect(auctionAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
  })
})
