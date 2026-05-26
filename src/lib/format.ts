export function shortenAddress(address: string, visible = 4) {
  if (!address) {
    return ''
  }

  return `${address.slice(0, visible + 2)}...${address.slice(-visible)}`
}

export function formatCountdown(secondsLeft: number) {
  const safeSeconds = Math.max(0, secondsLeft)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}
