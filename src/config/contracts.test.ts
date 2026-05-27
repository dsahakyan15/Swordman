import { afterEach, describe, expect, it, vi } from 'vitest'

async function importContracts() {
  vi.resetModules()
  return import('./contracts')
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('contract configs', () => {
  it('exposes ABI arrays from imported contract artifacts', async () => {
    const { auctionConfig, bankeerConfig } = await importContracts()

    expect(Array.isArray(bankeerConfig.abi)).toBe(true)
    expect(Array.isArray(auctionConfig.abi)).toBe(true)
  })

  it('exposes local contract address fallbacks', async () => {
    const { LOCAL_AUCTION_ADDRESS, LOCAL_BANKEER_ADDRESS } = await importContracts()

    expect(LOCAL_BANKEER_ADDRESS).toBe('0x5FbDB2315678afecb367f032d93F642f64180aa3')
    expect(LOCAL_AUCTION_ADDRESS).toBe('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')
  })

  it('uses local contract addresses when env values are missing', async () => {
    vi.stubEnv('VITE_BANKEER_ADDRESS', undefined)
    vi.stubEnv('VITE_AUCTION_ADDRESS', undefined)

    const {
      LOCAL_AUCTION_ADDRESS,
      LOCAL_BANKEER_ADDRESS,
      auctionAddress,
      bankeerAddress,
    } = await importContracts()

    expect(bankeerAddress).toBe(LOCAL_BANKEER_ADDRESS)
    expect(auctionAddress).toBe(LOCAL_AUCTION_ADDRESS)
  })

  it('uses local contract addresses when env values are empty', async () => {
    vi.stubEnv('VITE_BANKEER_ADDRESS', '   ')
    vi.stubEnv('VITE_AUCTION_ADDRESS', '')

    const {
      LOCAL_AUCTION_ADDRESS,
      LOCAL_BANKEER_ADDRESS,
      auctionAddress,
      bankeerAddress,
    } = await importContracts()

    expect(bankeerAddress).toBe(LOCAL_BANKEER_ADDRESS)
    expect(auctionAddress).toBe(LOCAL_AUCTION_ADDRESS)
  })

  it('uses explicit env override contract addresses', async () => {
    const overrideBankeerAddress = '0x1111111111111111111111111111111111111111'
    const overrideAuctionAddress = '0x2222222222222222222222222222222222222222'
    vi.stubEnv('VITE_BANKEER_ADDRESS', ` ${overrideBankeerAddress} `)
    vi.stubEnv('VITE_AUCTION_ADDRESS', overrideAuctionAddress)

    const { auctionAddress, bankeerAddress } = await importContracts()

    expect(bankeerAddress).toBe(overrideBankeerAddress)
    expect(auctionAddress).toBe(overrideAuctionAddress)
  })

  it('uses valid contract addresses', async () => {
    const { auctionAddress, bankeerAddress } = await importContracts()

    expect(bankeerAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
    expect(auctionAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
  })
})
