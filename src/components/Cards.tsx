import { Heart, Plus, ShoppingBag } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'

import { MENU, PROMOS, categoryById, type Category, type Deal, type Dish, type Review } from '../data'
import { cx, cycleRemaining, useNow } from '../lib/hooks'
import { useStore } from '../lib/store'
import { basePrice, dealFor, money, wasPrice } from '../shared/pricing'
import { Button, IconButton } from './Button'
import { Avatar, Badge, Countdown, DishMeta, OrderNowLink, Photo, QtyStepper, RatingPill, Stars } from './Display'
import { useToast } from './Overlay'

/** Adds a dish with its default options and confirms with a toast. */
export function useQuickAdd() {
  const { add, setCartOpen } = useStore()
  const toast = useToast()
  return (dish: Dish, quantity = 1) => {
    add(dish, { quantity })
    toast(
      <>
        Added {quantity > 1 ? `${quantity} × ` : ''}
        {dish.name}
      </>,
      <button type="button" onClick={() => setCartOpen(true)} className="round h-9 rounded-full bg-sun px-4 text-[13px] font-medium text-ink hover:bg-sun-2">
        View cart
      </button>,
    )
  }
}

export function Price({ dish, size = 'md' }: { dish: Dish; size?: 'sm' | 'md' | 'lg' }) {
  const was = wasPrice(dish)
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className={cx('font-semibold tabular-nums', size === 'sm' && 'text-[15px]', size === 'md' && 'text-[20px]', size === 'lg' && 'text-[28px]')}>{money(basePrice(dish))}</span>
      {was && (
        <span className={cx('text-muted line-through tabular-nums', size === 'lg' ? 'text-[17px]' : 'text-[13px]')}>
          <span className="sr-only">was </span>
          {money(was)}
        </span>
      )}
    </span>
  )
}

export function SaveButton({ slug, name, className, force }: { slug: string; name: string; className?: string; force?: string }) {
  const { saved, toggleSaved } = useStore()
  const on = saved.includes(slug)
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from saved` : `Save ${name}`}
      onClick={() => toggleSaved(slug)}
      data-force={force}
      className={cx(
        'round relative z-[2] inline-flex size-10 items-center justify-center rounded-full transition-[color,transform,background-color] hov:bg-black/5 prs:scale-90',
        on ? 'text-tomato' : 'text-muted hov:text-ink',
        className,
      )}
    >
      <Heart className={cx('size-[18px] transition-transform', on && 'scale-110')} fill={on ? 'currentColor' : 'none'} aria-hidden />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Dish card ("Our top picks", menu grid)

export function DishCard({ dish, saveable, force }: { dish: Dish; saveable?: boolean; force?: string }) {
  const quickAdd = useQuickAdd()
  const deal = dealFor(dish.slug)
  return (
    <article
      data-force={force}
      className="group relative flex flex-col rounded-[var(--radius-md)] bg-card p-5 transition-[background-color,transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out)] hov:-translate-y-1 hov:bg-card-2 hov:shadow-[var(--shadow-card)] has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-leaf"
    >
      <div className="flex h-10 items-center justify-between">
        <div className="flex items-center gap-1">
          {saveable && <SaveButton slug={dish.slug} name={dish.name} className="-ml-2" />}
          {deal && <Badge tone="sun">{deal.off}% off</Badge>}
        </div>
        <RatingPill value={dish.rating} />
      </div>
      <div className="flex aspect-[16/10] items-center justify-center">
        <Photo name={dish.photo} className="h-full w-auto max-w-[78%] transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)] group-hover:scale-[1.06] group-hover:-rotate-2" />
      </div>
      <h3 className="mt-4 text-[18px] leading-snug font-semibold">
        <Link to={`/menu/${dish.slug}`} className="stretched outline-none">
          {dish.name}
        </Link>
      </h3>
      <p className="mt-0.5 text-[14px] text-muted">{categoryById(dish.category)?.name}</p>
      <DishMeta minutes={dish.minutes} calories={dish.calories} className="mt-2" />
      <div className="mt-4 flex items-center justify-between">
        <Price dish={dish} />
        <IconButton tone="leaf" size="sm" aria-label={`Add ${dish.name} to cart`} onClick={() => quickAdd(dish)} className="relative z-[2]">
          <Plus aria-hidden strokeWidth={2.5} />
        </IconButton>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Flash deal cards

function useDealClock(deal: Deal, index: number) {
  const now = useNow(1000)
  return cycleRemaining(deal.cycleHours, now, index * 977)
}

export function DealCard({ deal, index = 0, featured, secondsOverride }: { deal: Deal; index?: number; featured?: boolean; secondsOverride?: number }) {
  const dish = MENU.find((d) => d.slug === deal.slug)!
  const live = useDealClock(deal, index)
  const seconds = secondsOverride ?? live
  const ended = seconds <= 0
  const [qty, setQty] = useState(1)
  const quickAdd = useQuickAdd()
  const add = () => {
    quickAdd(dish, qty)
    setQty(1)
  }

  if (featured)
    return (
      <article className="relative flex h-full flex-col rounded-[var(--radius-md)] border bg-white p-5">
        <div className="flex items-center justify-between">
          <Badge tone="sun">{deal.off}% off</Badge>
          <SaveButton slug={dish.slug} name={dish.name} className="-mr-2" />
        </div>
        <Link to={`/menu/${dish.slug}`} className="group mx-auto my-3 block w-[78%] outline-none" tabIndex={-1} aria-hidden>
          <Photo name={dish.photo} className="aspect-square w-full transition-transform duration-[var(--duration-slow)] group-hover:rotate-12" />
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2">
          <Countdown seconds={seconds} />
          <Stars value={dish.rating} size={12} />
        </div>
        <h3 className="mt-3 text-[20px] font-semibold">
          <Link to={`/menu/${dish.slug}`} className="hover:underline max-sm:inline-flex max-sm:min-h-10 max-sm:items-center">
            {dish.name}
          </Link>
        </h3>
        <div className="mt-1">
          <Price dish={dish} size="sm" />
        </div>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">{dish.description}</p>
        <div className="mt-4 flex items-center gap-3">
          <QtyStepper size="sm" value={qty} onChange={setQty} label={`Quantity of ${dish.name}`} disabled={ended} />
          <Button variant="leaf" size="sm" className="flex-1" onClick={add} disabled={ended}>
            Add to cart
          </Button>
        </div>
      </article>
    )

  return (
    <article className="relative flex flex-col gap-3 border-b py-4 last:border-b-0 sm:px-1">
      <div className="flex gap-3">
        <Link to={`/menu/${dish.slug}`} className="flex w-[34%] shrink-0 items-center justify-center pt-6" tabIndex={-1} aria-hidden>
          <Photo name={dish.photo} className="aspect-square w-full" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <Badge tone="sun">{deal.off}% off</Badge>
            <SaveButton slug={dish.slug} name={dish.name} className="-mt-2 -mr-2" />
          </div>
          <h3 className="mt-1 text-[15px] leading-snug font-semibold">
            <Link to={`/menu/${dish.slug}`} className="hover:underline max-sm:inline-flex max-sm:min-h-10 max-sm:items-center">
              {dish.name}
            </Link>
          </h3>
          <Stars value={dish.rating} size={12} className="mt-1" />
          <div className="mt-1">
            <Price dish={dish} size="sm" />
          </div>
          <div className="mt-2">
            <QtyStepper size="sm" value={qty} onChange={setQty} label={`Quantity of ${dish.name}`} disabled={ended} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Countdown seconds={seconds} />
        <Button variant="leaf" size="sm" onClick={add} disabled={ended} icon={<ShoppingBag className="size-4" aria-hidden />}>
          Add to cart
        </Button>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Category tile

export function CategoryTile({ category, selected, onClick, to, className, force }: { category: Category; selected?: boolean; onClick?: () => void; to?: string; className?: string; force?: string }) {
  const count = MENU.filter((d) => d.category === category.id).length
  const inner = (
    <>
      <span className={cx('round flex size-14 items-center justify-center rounded-full transition-colors', selected ? 'bg-white/15' : 'bg-card')}>
        <Photo name={category.photo} alt="" className="size-9" />
      </span>
      <span className="text-[15px] leading-tight font-semibold">{category.name}</span>
      <span className={cx('text-[12px]', selected ? 'text-on-forest-muted' : 'text-muted')}>
        {count} dish{count === 1 ? '' : 'es'}
      </span>
    </>
  )
  const cls = cx(
    'flex w-[150px] flex-col items-center gap-2 rounded-[var(--radius-md)] px-3 py-5 text-center shadow-[var(--shadow-card)] transition-[transform,background-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out)] hov:-translate-y-1 hov:shadow-[var(--shadow-float)] prs:translate-y-0',
    selected ? 'bg-forest text-white' : 'bg-white text-ink',
    className,
  )
  if (to)
    return (
      <Link to={to} className={cls} data-force={force}>
        {inner}
      </Link>
    )
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={cls} data-force={force}>
      {inner}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Promo cards

function UpTo({ value, className, tone = 'ink' }: { value: number; className?: string; tone?: 'ink' | 'tomato' | 'maroon' }) {
  return (
    <span className={cx('flex flex-col leading-none', tone === 'tomato' && 'text-tomato-ink', tone === 'maroon' && 'text-[#5b1d10]', className)}>
      <span className="text-[19px] font-medium">Up to</span>
      <span className="text-[44px] font-bold tracking-[-0.03em]">
        {value}
        <span className="align-top text-[26px]">%</span>
      </span>
    </span>
  )
}

export function PromoFresh({ className }: { className?: string }) {
  const p = PROMOS.fresh
  return (
    <article className={cx('relative isolate flex min-h-[300px] overflow-hidden rounded-[var(--radius-lg)] bg-sun-soft p-7', className)}>
      <div className="absolute inset-y-0 right-0 -z-10 w-[56%] bg-sun [clip-path:polygon(22%_0,100%_0,100%_100%,0_100%)]" />
      <div className="relative z-10 flex max-w-[56%] flex-col">
        <p className="text-[20px] leading-tight">{p.eyebrow}</p>
        <h3 className="mt-5 text-[24px] leading-[1.15] font-bold text-[#3a2a0a]">{p.title}</h3>
        <div className="mt-auto pt-6">
          <OrderNowLink to={p.to}>{p.cta}</OrderNowLink>
        </div>
      </div>
      <UpTo value={p.upTo} tone="maroon" className="absolute top-[34%] left-[46%] z-10" />
      <Photo name="chickenBowl" className="absolute -right-6 bottom-2 w-[48%] max-w-[260px] drop-shadow-[var(--shadow-food)]" />
      <Photo name="salad" className="absolute -top-6 right-[2%] w-[30%] max-w-[170px] rotate-12" />
    </article>
  )
}

export function PromoPizza({ className }: { className?: string }) {
  const p = PROMOS.pizza
  return (
    <article className={cx('on-dark relative isolate flex min-h-[270px] overflow-hidden rounded-[var(--radius-lg)] bg-forest p-7 text-white', className)}>
      <svg className="absolute bottom-0 left-0 -z-10 h-[46%] w-[70%]" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40c40-10 60 20 100 10s50-40 90-30 40 40 80 40 60-30 90-20 40 30 40 30v70H0z" fill="var(--color-lime)" />
      </svg>
      <div className="relative z-10 flex flex-col">
        <p className="text-[20px] font-semibold text-sun">{p.eyebrow}</p>
        <h3 className="mt-1 max-w-[260px] text-[34px] leading-[1.05] font-bold">{p.title}</h3>
        <div className="mt-auto pt-6">
          <OrderNowLink to={p.to}>{p.cta}</OrderNowLink>
        </div>
      </div>
      <span className="round absolute top-[42%] left-[44%] z-10 flex size-[118px] items-center justify-center rounded-full bg-sun text-ink shadow-[var(--shadow-card)]">
        <UpTo value={p.upTo} />
      </span>
      <Photo name="pizzaPepperoni" className="absolute -right-[12%] -bottom-[18%] w-[62%] max-w-[330px] drop-shadow-[var(--shadow-food)]" />
    </article>
  )
}

export function PromoBurger({ className }: { className?: string }) {
  const p = PROMOS.burger
  return (
    <article className={cx('on-dark relative isolate flex min-h-[580px] flex-col overflow-hidden rounded-[var(--radius-lg)] bg-tomato p-7 text-white', className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 flex flex-col justify-center gap-2 overflow-hidden text-[120px] leading-[0.9] font-bold text-white/[0.07] select-none" aria-hidden>
        {['Burger', 'Burger', 'Burger', 'Burger', 'Burger'].map((w, i) => (
          <span key={i} className={cx('whitespace-nowrap', i % 2 === 1 && 'pl-24')}>
            {w} {w}
          </span>
        ))}
      </div>
      <h3 className="max-w-[300px] text-[38px] leading-[1.05] font-bold">{p.title}</h3>
      <div className="relative my-4 flex flex-1 items-center justify-center">
        <Photo name="burger" className="w-[78%] max-w-[360px] -rotate-6 drop-shadow-[var(--shadow-food)] motion-safe:animate-float" />
        <span className="absolute top-[12%] right-0 flex size-[124px] items-center justify-center text-tomato-ink">
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full motion-safe:animate-spin-slow" aria-hidden>
            <path
              fill="#fff"
              d="M50 2l6 7 9-4 3 9 10-1-1 10 9 3-4 9 7 6-7 6 4 9-9 3 1 10-10-1-3 9-9-4-6 7-6-7-9 4-3-9-10 1 1-10-9-3 4-9-7-6 7-6-4-9 9-3-1-10 10 1 3-9 9 4z"
            />
          </svg>
          <UpTo value={p.upTo} tone="tomato" className="relative items-center" />
        </span>
        <span className="absolute bottom-[20%] left-0 -rotate-[18deg] rounded-[6px] bg-white px-3 py-1.5 text-[15px] font-bold text-tomato-ink shadow-md">{p.ribbons[0]}</span>
        <span className="absolute bottom-[8%] left-[18%] -rotate-[14deg] rounded-[6px] bg-sun px-3 py-1.5 text-[15px] font-bold text-ink shadow-md">{p.ribbons[1]}</span>
      </div>
      <div className="flex justify-end">
        <OrderNowLink to={p.to}>{p.cta}</OrderNowLink>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Review card

export function ReviewCard({ review, tone = 'card' }: { review: Review; tone?: 'card' | 'white' }) {
  const dish = MENU.find((d) => d.slug === review.dish)
  return (
    <figure className={cx('flex h-full flex-col gap-4 rounded-[var(--radius-md)] p-6', tone === 'card' ? 'bg-card' : 'bg-white shadow-[var(--shadow-card)]')}>
      <Stars value={review.rating} showValue={false} size={16} />
      <blockquote className="flex-1 text-[16px] leading-relaxed">{review.body}</blockquote>
      <figcaption className="flex items-center gap-3">
        <Avatar index={review.avatar} />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold">{review.name}</p>
          <p className="truncate text-[13px] text-muted">
            {dish ? (
              <Link to={`/menu/${dish.slug}`} className="hover:underline max-sm:inline-flex max-sm:min-h-10 max-sm:items-center">
                {dish.name}
              </Link>
            ) : null}
            {', '}
            {new Date(review.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </figcaption>
    </figure>
  )
}

export function StatTile({ value, label, children }: { value: string; label: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-md)] bg-card p-5">
      <span className="text-[30px] font-semibold tracking-[-0.02em]">{value}</span>
      <span className="text-[14px] text-muted">{label}</span>
      {children}
    </div>
  )
}
