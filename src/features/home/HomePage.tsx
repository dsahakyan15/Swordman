import { PixelButton } from '../../components/pixel/PixelButton'

export function HomePage() {
  return (
    <section className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12 text-center md:px-8">
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-5">
        <p className="text-xs uppercase tracking-[0.28em] text-purple-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
          Twilight Market / Localhost 8545
        </p>
        <h1 className="text-5xl uppercase tracking-[0.14em] text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.9)] sm:text-6xl md:text-7xl">
          BANKEER
        </h1>
        <p className="max-w-[34ch] text-sm leading-7 text-slate-100 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] sm:text-base">
          A fantasy auction hall rendered like modern indie pixel art: layered skies,
          glass panels, and local-chain bidding.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <PixelButton variant="primary" fullWidth>
            Enter Game
          </PixelButton>
          <PixelButton variant="secondary" fullWidth>
            Connect Wallet
          </PixelButton>
        </div>
        <div className="grid w-full max-w-sm grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              aria-label="Featured slot"
              className="aspect-square bg-slate-950/60 shadow-[inset_0_0_0_1px_rgba(129,140,248,0.32)] backdrop-blur-sm [image-rendering:pixelated]"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
