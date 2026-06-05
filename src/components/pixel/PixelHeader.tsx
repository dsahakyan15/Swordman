import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import type { WalletState } from '../../web3/WalletProvider'
import { PixelButton } from './PixelButton'
import { WalletConnectButton } from './WalletConnectButton'

type PixelHeaderProps = {
  walletState: WalletState
  onConnect: () => void
  onSwitchNetwork: () => void
  onDisconnect: () => void
}

const navigationLinks = [
  { to: '/', label: 'Home' },
  { to: '/auction', label: 'Auction' },
  { to: '/portfolio', label: 'Portfolio' },
]

export function PixelHeader({
  walletState,
  onConnect,
  onSwitchNetwork,
  onDisconnect,
}: PixelHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    function handleDocumentMouseDown(event: MouseEvent) {
      if (headerRef.current?.contains(event.target as Node)) {
        return
      }

      setIsMenuOpen(false)
    }

    document.addEventListener('mousedown', handleDocumentMouseDown)

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown)
    }
  }, [isMenuOpen])

  return (
    <header
      ref={headerRef}
      className="relative z-20 bg-gradient-to-b from-slate-950/70 to-transparent px-4 py-4 text-white md:px-8"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          to="/"
          className="text-lg uppercase tracking-[0.25em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        >
          Bankeer
        </Link>
        <nav
          aria-label="Desktop navigation"
          className="hidden items-center gap-4 text-sm uppercase tracking-[0.18em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] md:flex"
        >
          {navigationLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
            className="border border-white/30 bg-slate-950/40 px-3 py-2 text-white md:hidden"
          >
            Menu
          </button>
          <WalletConnectButton
            walletState={walletState}
            onConnect={onConnect}
            onSwitchNetwork={onSwitchNetwork}
          />
          {walletState.status === 'connected' ? (
            <PixelButton
              variant="danger"
              className="px-3 py-2 text-xs"
              onClick={onDisconnect}
              aria-label="Disconnect wallet"
            >
              Exit
            </PixelButton>
          ) : null}
        </div>
      </div>
      {isMenuOpen ? (
        <nav
          aria-label="Mobile navigation"
          className="absolute left-4 right-4 top-full z-30 grid gap-2 border border-indigo-400/40 bg-slate-950/85 p-3 text-sm uppercase tracking-[0.18em] text-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm md:hidden"
        >
          {navigationLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMenuOpen(false)}
              className="border border-white/10 bg-white/5 px-3 py-2 text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  )
}
