import { afterEach, describe, expect, it, vi } from 'vitest'

import { expandTokenUri, fetchTokenMetadata, ipfsToHttp, resetIpfsCaches } from './ipfsHelper'

describe('ipfsHelper', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    resetIpfsCaches()
  })

  it('converts ipfs URIs to the public gateway', () => {
    expect(ipfsToHttp('ipfs://QmHash/file.png')).toBe('https://ipfs.io/ipfs/QmHash/file.png')
  })

  it('expands {id} with the token id string used by the local metadata server', () => {
    expect(expandTokenUri('ipfs://QmMeta/{id}.json', 1)).toBe('ipfs://QmMeta/1.json')
    expect(expandTokenUri('ipfs://QmMeta/{id}.json', 15)).toBe('ipfs://QmMeta/15.json')
  })

  it('fetches metadata, expands {id}, and normalizes the image URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          name: 'Coin',
          description: 'Bankeer currency',
          image: 'ipfs://QmImage/coin.png',
        }),
      }),
    )

    const result = await fetchTokenMetadata('ipfs://QmMeta/{id}.json', 1)

    expect(fetch).toHaveBeenCalledWith(
      'https://ipfs.io/ipfs/QmMeta/1.json',
    )
    expect(result.imageUrl).toBe('https://ipfs.io/ipfs/QmImage/coin.png')
  })

  it('memoizes repeated requests for the same token metadata', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          name: 'Coin',
          image: 'ipfs://QmImage/coin.png',
        }),
      }),
    )

    await fetchTokenMetadata('ipfs://QmMeta/{id}.json', 1)
    await fetchTokenMetadata('ipfs://QmMeta/{id}.json', 1)

    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
