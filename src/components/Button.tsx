import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'

import { cx } from '../lib/hooks'

export type ButtonVariant = 'sun' | 'leaf' | 'white' | 'outline' | 'outline-light' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export const BUTTON_VARIANTS: ButtonVariant[] = ['sun', 'leaf', 'white', 'outline', 'outline-light', 'ghost']

const base =
  'round relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)] prs:translate-y-px prs:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45'

const variants: Record<ButtonVariant, string> = {
  sun: 'bg-sun text-ink hov:bg-sun-2 hov:shadow-[0_10px_24px_-10px_rgb(247_195_46/0.9)] prs:bg-[#e9b41f]',
  leaf: 'bg-leaf text-white hov:bg-leaf-2 prs:bg-forest-2',
  white: 'bg-white text-ink shadow-[0_6px_18px_-8px_rgb(0_0_0/0.35)] hov:bg-card prs:bg-card-2',
  outline: 'border-[1.5px] border-leaf text-leaf hov:bg-leaf hov:text-white prs:bg-forest-2 prs:text-white',
  'outline-light': 'on-dark border-[1.5px] border-white/85 text-white hov:bg-white hov:text-forest prs:bg-white/85 prs:text-forest',
  ghost: 'text-ink hov:bg-card prs:bg-card-2',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-[14px]',
  md: 'h-12 px-6 text-[15px]',
  lg: 'h-14 px-8 text-[17px]',
}

export function buttonClass(variant: ButtonVariant = 'sun', size: ButtonSize = 'md', className?: string) {
  return cx(base, variants[variant], sizes[size], className)
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode; iconRight?: ReactNode; force?: string }

export function Button({
  variant = 'sun',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  force,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      type={type}
      data-force={force}
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  )
}

export function ButtonLink({ variant = 'sun', size = 'md', icon, iconRight, force, className, children, ...rest }: Common & LinkProps) {
  return (
    <Link data-force={force} className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      <span>{children}</span>
      {iconRight}
    </Link>
  )
}

export type IconTone = 'leaf' | 'sun' | 'white' | 'card' | 'outline-light' | 'ghost'
export const ICON_TONES: IconTone[] = ['leaf', 'sun', 'white', 'card', 'outline-light', 'ghost']

const tones: Record<IconTone, string> = {
  leaf: 'bg-leaf text-white hov:bg-leaf-2 prs:bg-forest-2',
  sun: 'bg-sun text-ink hov:bg-sun-2',
  white: 'bg-white text-ink shadow-[0_4px_14px_-6px_rgb(0_0_0/0.3)] hov:bg-card',
  card: 'bg-card text-ink hov:bg-card-2',
  'outline-light': 'on-dark border-[1.5px] border-white/70 text-white hov:bg-white hov:text-forest',
  ghost: 'text-current hov:bg-current/10',
}

/** Round icon-only button. Always pass an aria-label. */
export function IconButton({
  className,
  tone = 'leaf',
  size = 'md',
  pressed,
  force,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: IconTone; size?: 'sm' | 'md' | 'lg'; pressed?: boolean; force?: string; 'aria-label': string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      data-force={force}
      className={cx(
        'round inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform,border-color] duration-[var(--duration-fast)] prs:scale-90 disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' && 'size-10 [&_svg]:size-4',
        size === 'md' && 'size-11 [&_svg]:size-[18px]',
        size === 'lg' && 'size-12 [&_svg]:size-5',
        tones[tone],
        className,
      )}
      {...rest}
    />
  )
}
