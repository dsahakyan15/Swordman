import { Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-300">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/sky.png)' }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: 'url(/clouds.png)' }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[70vh] bg-contain bg-bottom bg-no-repeat"
        style={{ backgroundImage: 'url(/castle.png)' }}
      />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <Outlet />
      </main>
    </div>
  )
}
