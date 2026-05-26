import { useEffect, useState } from 'react'

import { fetchTokenMetadata } from '../../lib/ipfsHelper'
import { getReadBankeerContract } from '../../web3/contracts'

export function useCoinMetadata() {
  const [coinMeta, setCoinMeta] = useState<{ name: string; imageUrl: string } | null>(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      const contract = getReadBankeerContract()
      const uri = await contract.uri(1)
      const metadata = await fetchTokenMetadata(uri, 1)

      if (isMounted) {
        setCoinMeta({
          name: metadata.name,
          imageUrl: metadata.imageUrl,
        })
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [])

  return coinMeta
}
