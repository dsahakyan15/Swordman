import { Outlet } from 'react-router-dom'

import { PixelHeader } from '../components/pixel/PixelHeader'
import { ToastProvider } from '../components/pixel/ToastProvider'
import { WalletProvider } from '../web3/WalletProvider'
import { useWallet } from '../web3/useWallet'

export function AppShell() {
  return (
    <ToastProvider>
      <WalletProvider>
        <ShellContent />
      </WalletProvider>
    </ToastProvider>
  )
}

function ShellContent() {
  const { walletState, connect, switchToLocalhost } = useWallet()

  return (
    <div
      data-testid="app-shell"
      className="relative isolate min-h-screen overflow-hidden bg-[#070b18] text-white"
    >
      <div className="absolute inset-0 z-[-3] bg-[url('/sky.png')] bg-cover bg-center bg-no-repeat [image-rendering:pixelated]" />
      <div className="pointer-events-none absolute inset-0 z-[-2] bg-[url('/clouds.png')] bg-contain bg-center bg-no-repeat opacity-80 [image-rendering:pixelated] animate-[clouds_28s_linear_infinite]" />
      <div className="absolute inset-0 z-[-1] bg-[url('/castle.png')] bg-cover bg-center bg-no-repeat [image-rendering:pixelated]" />
      <PixelHeader
        walletState={walletState}
        onConnect={() => void connect()}
        onSwitchNetwork={() => void switchToLocalhost()}
      />
      <main className="relative z-10 min-h-[calc(100vh-72px)] px-6 py-12">
        <Outlet />
      </main>
    </div>
  )
}
