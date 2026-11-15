import { Clock, Flame, Minus, Plus, Star } from 'lucide-react'
import { motion } from 'motion/react'
import { useId, type ReactNode } from 'react'
import { Link } from 'react-router'

import { AVATARS, PHOTOS, type PhotoKey } from '../data'
import { cx, splitTime } from '../lib/hooks'

// ---------------------------------------------------------------------------
// Logo

export function Logo({ tone = 'light', className }: { tone?: 'light' | 'dark'; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5 font-semibold tracking-[-0.02em]', tone === 'light' ? 'text-white' : 'text-forest', className)}>
      <svg viewBox="0 0 40 40" className="size-9" aria-hidden>
        <path d="M6 26c4 6 12 9 20 6" stroke="var(--color-sun)" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M3 19c2 4 5 7 9 8.5" stroke="var(--color-sun)" strokeWidth="3.4" fill="none" strokeLinecap="round" opacity=".55" />
        <path
          d="M17 5v9a4 4 0 0 0 3 3.8V33a2 2 0 0 0 4 0V17.8A4 4 0 0 0 27 14V5M22 5v8M33 5c-2.2 0-3.6 4.4-3.6 10 0 2 1 3.6 2.6 4V33a2 2 0 0 0 4 0V5z"
          stroke="currentColor"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[24px] leading-none">Forkfast</span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Photo: every image goes through PHOTOS in data.ts

export function Photo({ name, className, alt, eager }: { name: PhotoKey; className?: string; alt?: string; eager?: boolean }) {
  const p = PHOTOS[name]
  return <img src={p.src} alt={alt ?? p.alt} className={cx('select-none object-contain', className)} draggable={false} loading={eager ? 'eager' : 'lazy'} decoding="async" />
}

export function AvatarStack({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cx('flex', className)}>
      {AVATARS.slice(0, count).map((src, i) => (
        <img key={src} src={src} alt="" className="round -ml-2.5 size-11 rounded-full border-2 border-forest first:ml-0" style={{ zIndex: count - i }} />
      ))}
    </div>
  )
}

export function Avatar({ index, className }: { index: number; className?: string }) {
  return <img src={AVATARS[index % AVATARS.length]} alt="" className={cx('round size-11 rounded-full', className)} />
}

// ---------------------------------------------------------------------------
// Badge

export type BadgeTone = 'sun' | 'leaf' | 'lime' | 'tomato' | 'neutral' | 'forest'
export const BADGE_TONES: BadgeTone[] = ['sun', 'leaf', 'lime', 'tomato', 'neutral', 'forest']

export function Badge({ tone = 'sun', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex h-6 items-center gap-1 rounded-[8px] px-2 text-[12px] font-semibold leading-none whitespace-nowrap',
        tone === 'sun' && 'bg-sun text-ink',
        tone === 'leaf' && 'bg-leaf text-white',
        tone === 'lime' && 'bg-lime-soft text-forest',
        tone === 'tomato' && 'bg-tomato-ink text-white',
        tone === 'neutral' && 'bg-card text-muted',
        tone === 'forest' && 'bg-white/12 text-white',
        className,
      )}
    >
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Stars

export function Stars({ value, size = 14, showValue = true, className }: { value: number; size?: number; showValue?: boolean; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1', className)}>
      <span className="inline-flex" role="img" aria-label={`Rated ${value} out of 5`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, value - i))
          return (
            <span key={i} className="relative" style={{ width: size, height: size }}>
              <Star className="absolute inset-0 text-line-strong" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} aria-hidden />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="text-sun" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} aria-hidden />
              </span>
            </span>
          )
        })}
      </span>
      {showValue && <span className="text-[13px] font-medium tabular-nums">{value.toFixed(1)}</span>}
    </span>
  )
}

export function RatingPill({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1 text-[14px] font-medium', className)}>
      <Star className="size-4 text-sun" fill="currentColor" strokeWidth={0} aria-hidden />
      <span className="sr-only">Rated </span>
      {value.toFixed(1)}
    </span>
  )
}

/** A 1 to 5 star picker built on radio inputs, so arrows and Space work. */
export function StarInput({ value, onChange, error, name = 'rating' }: { value: number; onChange: (v: number) => void; error?: string; name?: string }) {
  const id = useId()
  return (
    <fieldset aria-describedby={error ? `${id}-err` : undefined}>
      <legend className="mb-2 text-[14px] font-medium">Your rating</legend>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="group relative cursor-pointer">
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="peer sr-only" />
            <span className="round flex size-11 items-center justify-center rounded-full transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-leaf group-hover:bg-card">
              <Star className={cx('size-7 transition-transform group-hover:scale-110', n <= value ? 'text-sun' : 'text-line-strong')} fill="currentColor" strokeWidth={0} aria-hidden />
            </span>
            <span className="sr-only">{n} star{n > 1 ? 's' : ''}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-[13px] text-tomato-ink">
          {error}
        </p>
      )}
    </fieldset>
  )
}

// ---------------------------------------------------------------------------
// Meta row: "18 min | 450 kcal"

export function DishMeta({ minutes, calories, className }: { minutes: number; calories: number; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 text-[13px] text-muted', className)}>
      <Clock className="size-3.5" aria-hidden />
      {minutes} min <span aria-hidden>|</span>
      <span className="sr-only">,</span> {calories} kcal
    </span>
  )
}

// ---------------------------------------------------------------------------
// Quantity stepper

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  size = 'md',
  label = 'Quantity',
  force,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  label?: string
  force?: string
  disabled?: boolean
}) {
  const btn = cx(
    'round inline-flex items-center justify-center rounded-full text-ink transition-colors hov:bg-card-2 disabled:opacity-35 disabled:pointer-events-none',
    size === 'sm' ? 'size-10 [&_svg]:size-3.5' : 'size-11 [&_svg]:size-4',
  )
  return (
    <div
      role="group"
      aria-label={label}
      data-force={force}
      className={cx('round inline-flex items-center rounded-full border border-line-strong bg-white', disabled && 'opacity-50')}
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={disabled || value <= min} aria-label={`Decrease ${label.toLowerCase()}`}>
        <Minus aria-hidden />
      </button>
      <span className={cx('text-center font-medium tabular-nums', size === 'sm' ? 'w-6 text-[13px]' : 'w-8 text-[15px]')} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label={`Increase ${label.toLowerCase()}`}>
        <Plus aria-hidden />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Countdown boxes: 01 : 45 : 32

export function Countdown({ seconds, size = 'sm', tone = 'card' }: { seconds: number; size?: 'sm' | 'md'; tone?: 'card' | 'white' }) {
  const { h, m, s } = splitTime(seconds)
  const ended = seconds <= 0
  const box = cx(
    'inline-flex items-center justify-center rounded-[8px] font-medium tabular-nums',
    size === 'sm' ? 'h-7 min-w-7 px-1 text-[12px]' : 'h-10 min-w-10 px-1.5 text-[15px]',
    tone === 'card' ? 'bg-card text-ink' : 'bg-white text-ink',
  )
  if (ended) return <span className="text-[13px] font-medium text-tomato-ink">Deal ended</span>
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <span role="timer" aria-label={`Ends in ${h} hours ${m} minutes ${s} seconds`} className="inline-flex items-center gap-1 text-muted">
      <span className={box} aria-hidden>
        {pad(h)}
      </span>
      <span aria-hidden>:</span>
      <span className={box} aria-hidden>
        {pad(m)}
      </span>
      <span aria-hidden>:</span>
      <span className={box} aria-hidden>
        {pad(s)}
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Chip (toggle filter)

export function Chip({
  selected,
  onClick,
  children,
  icon,
  force,
  disabled,
}: {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  icon?: ReactNode
  force?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      data-force={force}
      disabled={disabled}
      className={cx(
        'round inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors duration-[var(--duration-fast)] prs:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none',
        selected ? 'border-forest bg-forest text-white' : 'border-line-strong bg-white text-ink hov:border-forest hov:bg-lime-soft',
      )}
    >
      {icon}
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Section heading

export function SectionHeading({
  title,
  body,
  align = 'left',
  action,
  className,
  as: As = 'h2',
}: {
  title: ReactNode
  body?: ReactNode
  align?: 'left' | 'center' | 'split'
  action?: ReactNode
  className?: string
  as?: 'h1' | 'h2'
}) {
  if (align === 'split')
    return (
      <div className={cx('flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-10', className)}>
        <As className="max-w-[440px] text-[clamp(1.9rem,1.2rem+1.8vw,2.4rem)] leading-[1.12] font-semibold">{title}</As>
        {(body || action) && (
          <div className="flex max-w-[400px] flex-col gap-4 md:pt-2">
            {body && <p className="text-[14px] leading-relaxed text-muted">{body}</p>}
            {action}
          </div>
        )}
      </div>
    )
  return (
    <div className={cx('flex flex-col gap-3', align === 'center' && 'items-center text-center', className)}>
      <As className="text-[clamp(1.9rem,1.2rem+1.8vw,2.6rem)] leading-[1.1] font-semibold">{title}</As>
      {body && <p className="max-w-[560px] text-[16px] leading-relaxed text-muted">{body}</p>}
      {action}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state, skeleton

export function EmptyState({ icon, title, body, action, tone = 'card' }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode; tone?: 'card' | 'plain' }) {
  return (
    <div className={cx('flex flex-col items-center gap-3 px-6 py-14 text-center', tone === 'card' && 'rounded-[var(--radius-lg)] bg-card')}>
      {icon && <div className="round mb-1 flex size-16 items-center justify-center rounded-full bg-white text-forest shadow-[var(--shadow-card)] [&_svg]:size-7">{icon}</div>}
      <h3 className="text-[20px] font-semibold">{title}</h3>
      {body && <p className="max-w-[360px] text-[15px] text-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('skeleton rounded-[var(--radius-sm)]', className)} aria-hidden />
}

export function DishCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-md)] bg-card p-5" aria-hidden>
      <Skeleton className="mx-auto mb-4 aspect-[4/3] w-3/4 rounded-full bg-card-2" />
      <Skeleton className="mb-2 h-5 w-2/3 bg-white" />
      <Skeleton className="mb-4 h-4 w-1/3 bg-white" />
      <Skeleton className="h-6 w-1/4 bg-white" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Reveal on scroll

export function Reveal({ children, delay = 0, className, y = 18 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// "Order now" pill with a flame, as on the promo cards

export function OrderNowLink({ to, children, className, force }: { to: string; children: ReactNode; className?: string; force?: string }) {
  return (
    <Link
      to={to}
      data-force={force}
      className={cx(
        'round group/pill inline-flex h-11 items-center gap-2 rounded-full bg-white pr-3 pl-5 text-[14px] font-medium text-ink shadow-[0_6px_18px_-8px_rgb(0_0_0/0.35)] transition-[transform,background-color] duration-[var(--duration-fast)] hov:bg-card prs:scale-[0.97]',
        className,
      )}
    >
      {children}
      <Flame className="size-5 text-tomato group-hover/pill:animate-wiggle" fill="var(--color-sun)" aria-hidden />
    </Link>
  )
}

/** A key-value row used in summaries. */
export function Row({ label, value, strong, tone, className }: { label: ReactNode; value: ReactNode; strong?: boolean; tone?: 'discount'; className?: string }) {
  return (
    <div className={cx('flex items-baseline justify-between gap-4', strong ? 'text-[18px] font-semibold' : 'text-[15px]', className)}>
      <dt className={strong ? '' : 'text-muted'}>{label}</dt>
      <dd className={cx('tabular-nums', tone === 'discount' && 'font-medium text-leaf')}>{value}</dd>
    </div>
  )
}
