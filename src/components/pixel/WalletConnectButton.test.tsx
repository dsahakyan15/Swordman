import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { PixelHeader } from './PixelHeader'
import { WalletConnectButton } from './WalletConnectButton'

describe('WalletConnectButton', () => {
  it('renders a connect action when disconnected', () => {
    render(
      <WalletConnectButton
        walletState={{ address: '', status: 'disconnected' }}
        onConnect={vi.fn()}
        onSwitchNetwork={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
  })

  it('renders a switch action on the wrong network', () => {
    render(
      <WalletConnectButton
        walletState={{ address: '0x1234', status: 'wrong-network' }}
        onConnect={vi.fn()}
        onSwitchNetwork={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /switch to localhost 8545/i })).toBeInTheDocument()
  })

  it('calls onConnect in the disconnected state', () => {
    const onConnect = vi.fn()

    render(
      <WalletConnectButton
        walletState={{ address: '', status: 'disconnected' }}
        onConnect={onConnect}
        onSwitchNetwork={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }))

    expect(onConnect).toHaveBeenCalledTimes(1)
  })
})

describe('PixelHeader', () => {
  it('opens the mobile menu with a Portfolio link', () => {
    render(
      <MemoryRouter>
        <PixelHeader
          walletState={{ address: '', status: 'disconnected' }}
          onConnect={vi.fn()}
          onSwitchNetwork={vi.fn()}
          onDisconnect={vi.fn()}
        />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))

    const mobileMenu = screen.getByRole('navigation', { name: /mobile navigation/i })

    expect(within(mobileMenu).getByRole('link', { name: /portfolio/i })).toHaveAttribute(
      'href',
      '/portfolio',
    )
  })

  it('closes the mobile menu when clicking outside it', () => {
    render(
      <MemoryRouter>
        <PixelHeader
          walletState={{ address: '', status: 'disconnected' }}
          onConnect={vi.fn()}
          onSwitchNetwork={vi.fn()}
          onDisconnect={vi.fn()}
        />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    fireEvent.mouseDown(document.body)

    expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument()
  })

  it('shows a disconnect action when the wallet is connected', () => {
    const onDisconnect = vi.fn()

    render(
      <MemoryRouter>
        <PixelHeader
          walletState={{ address: '0x1234567890abcdef', status: 'connected' }}
          onConnect={vi.fn()}
          onSwitchNetwork={vi.fn()}
          onDisconnect={onDisconnect}
        />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /disconnect wallet/i }))

    expect(onDisconnect).toHaveBeenCalledTimes(1)
  })
})
