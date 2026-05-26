import { Link } from 'react-router-dom'

import type { WalletState } from '../../web3/WalletProvider'
import { WalletConnectButton } from './WalletConnectButton'

type PixelHeaderProps = {
  walletState: WalletState
  onConnect: () => void
  onSwitchNetwork: () => void
}

export function PixelHeader({
  walletState,
  onConnect,
  onSwitchNetwork,
}: PixelHeaderProps) {
  return (
    <header className="relative z-20 bg-gradient-to-b from-slate-950/70 to-transparent px-4 py-4 text-white md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          to="/"
          className="text-lg uppercase tracking-[0.25em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        >
          Bankeer
        </Link>
        <nav className="hidden items-center gap-4 text-sm uppercase tracking-[0.18em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] md:flex">
          <Link to="/">Home</Link>
          <Link to="/auction">Auction</Link>
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation menu"
            className="border border-white/30 bg-slate-950/40 px-3 py-2 text-white md:hidden"
          >
            Menu
          </button>
          <WalletConnectButton
            walletState={walletState}
            onConnect={onConnect}
            onSwitchNetwork={onSwitchNetwork}
          />
        </div>
      </div>
    </header>
  )
}
