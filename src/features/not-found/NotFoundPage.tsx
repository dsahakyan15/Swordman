import { Link } from 'react-router-dom'

import { PixelButton } from '../../components/pixel/PixelButton'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl items-center justify-center px-4 py-12 text-center">
      <div className="grid gap-5 rounded-none border-2 border-amber-300/70 bg-slate-950/70 p-6 text-white shadow-[0_0_0_4px_rgba(15,23,42,0.9),0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-sm [image-rendering:pixelated]">
        <p className="text-xs uppercase tracking-[0.26em] text-orange-100">Lost Route</p>
        <h1 className="text-5xl uppercase tracking-[0.18em] text-white md:text-7xl">404</h1>
        <p className="text-sm leading-6 text-slate-200">
          This path is outside the local auction map.
        </p>
        <Link to="/" className="block">
          <PixelButton variant="primary" fullWidth>
            Back Home
          </PixelButton>
        </Link>
      </div>
    </section>
  )
}
