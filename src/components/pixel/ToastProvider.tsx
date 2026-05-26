import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

type ToastTone = 'success' | 'error' | 'info'

type ToastItem = {
  id: number
  message: string
  tone: ToastTone
}

type ToastContextValue = {
  pushToast: (message: string, tone: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toneClasses: Record<ToastTone, string> = {
  success: 'border-emerald-400/60',
  error: 'border-pink-400/60',
  info: 'border-indigo-400/60',
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  function pushToast(message: string, tone: ToastTone) {
    const id = Date.now()
    setToasts((current) => [...current, { id, message, tone }])

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3200)
  }

  const value = useMemo(() => ({ pushToast }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 md:right-6 md:top-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-none border bg-slate-950/80 px-4 py-3 text-sm text-white backdrop-blur-sm ${toneClasses[toast.tone]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToasts() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToasts must be used inside ToastProvider')
  }

  return context
}
