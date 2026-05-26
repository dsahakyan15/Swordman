import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type PixelButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variantClasses: Record<PixelButtonVariant, string> = {
  primary: 'border-orange-400/80 hover:bg-orange-400/15',
  secondary: 'border-purple-400/80 hover:bg-purple-400/15',
  danger: 'border-pink-400/80 hover:bg-pink-400/15',
  ghost: 'border-indigo-300/60 hover:bg-white/10',
}

type PixelButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: PixelButtonVariant
    fullWidth?: boolean
  }
>

export function PixelButton({
  children,
  className = '',
  fullWidth = false,
  variant = 'secondary',
  ...props
}: PixelButtonProps) {
  return (
    <button
      className={[
        'rounded-none border bg-slate-950/60 px-4 py-3 text-sm uppercase tracking-[0.18em] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-sm transition-none disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
