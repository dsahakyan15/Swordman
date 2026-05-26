import { shortenAddress } from '../../lib/format'
import type { WalletState } from '../../web3/WalletProvider'
import { PixelButton } from './PixelButton'
import { PixelLoader } from './PixelLoader'

type WalletConnectButtonProps = {
  walletState: WalletState
  onConnect: () => void
  onSwitchNetwork: () => void
}

export function WalletConnectButton({
  walletState,
  onConnect,
  onSwitchNetwork,
}: WalletConnectButtonProps) {
  if (walletState.status === 'connected') {
    return <PixelButton variant="ghost">{shortenAddress(walletState.address)}</PixelButton>
  }

  if (walletState.status === 'wrong-network') {
    return (
      <PixelButton variant="danger" onClick={onSwitchNetwork}>
        Switch to Localhost 8545
      </PixelButton>
    )
  }

  return (
    <PixelButton
      variant="secondary"
      onClick={onConnect}
      disabled={walletState.status === 'connecting'}
    >
      {walletState.status === 'connecting' ? <PixelLoader /> : 'Connect Wallet'}
    </PixelButton>
  )
}
