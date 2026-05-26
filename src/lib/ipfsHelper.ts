const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'

export type TokenMetadata = {
  name: string
  description?: string
  imageUrl: string
  rawUri: string
}

const metadataCache = new Map<string, Promise<TokenMetadata>>()
const imageCache = new Map<string, string>()

export function ipfsToHttp(uri: string) {
  return uri.startsWith('ipfs://') ? uri.replace('ipfs://', IPFS_GATEWAY) : uri
}

export function expandTokenUri(template: string, tokenId: bigint | number) {
  return template.replace('{id}', String(tokenId))
}

export function resolveImageUrl(uri: string) {
  if (!imageCache.has(uri)) {
    imageCache.set(uri, ipfsToHttp(uri))
  }

  return imageCache.get(uri)!
}

export async function fetchTokenMetadata(uriTemplate: string, tokenId: bigint | number) {
  const rawUri = expandTokenUri(uriTemplate, tokenId)
  const cacheKey = `${tokenId}:${rawUri}`

  if (!metadataCache.has(cacheKey)) {
    metadataCache.set(
      cacheKey,
      (async () => {
        const response = await fetch(ipfsToHttp(rawUri))
        if (!response.ok) {
          throw new Error(`Failed to load metadata for token ${tokenId}`)
        }

        const metadata = (await response.json()) as {
          name?: string
          description?: string
          image?: string
        }

        return {
          name: metadata.name ?? `Item #${tokenId}`,
          description: metadata.description,
          imageUrl: metadata.image ? resolveImageUrl(metadata.image) : '',
          rawUri,
        }
      })(),
    )
  }

  return metadataCache.get(cacheKey)!
}

export function resetIpfsCaches() {
  metadataCache.clear()
  imageCache.clear()
}
