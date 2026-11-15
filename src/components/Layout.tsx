import { Menu, ShoppingBag, Trash2, Truck, UtensilsCrossed } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'

import { FOOTER, NAV, SITE } from '../data'
import { cx, postJson } from '../lib/hooks'
import { describeOptions, useStore } from '../lib/store'
import { money } from '../shared/pricing'
import { validateSubscribe } from '../shared/validation'
import { Button, ButtonLink, IconButton } from './Button'
import { EmptyState, Logo, Photo, QtyStepper } from './Display'
import { Input } from './Form'
import { Drawer } from './Overlay'

// ---------------------------------------------------------------------------
// Nav

export function Nav() {
  const { count, setCartOpen, lastAdded } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [bump, setBump] = useState(false)
  const location = useLocation()

  useEffect(() => setMenuOpen(false), [location.pathname])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    if (!lastAdded) return
    setBump(true)
    const t = window.setTimeout(() => setBump(false), 400)
    return () => window.clearTimeout(t)
  }, [lastAdded])

  const link = ({ isActive }: { isActive: boolean }) =>
    cx(
      'relative inline-flex h-10 items-center text-[15px] transition-colors after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:origin-left after:rounded-full after:bg-sun after:transition-transform after:duration-[var(--duration-base)]',
      isActive ? 'text-white after:scale-x-100' : 'text-white/85 after:scale-x-0 hover:text-white hover:after:scale-x-100',
    )

  return (
    <header className={cx('on-dark sticky top-0 z-40 bg-forest transition-shadow duration-[var(--duration-base)]', scrolled && 'shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)]')}>
      <a href="#main" className="sr-only rounded-full bg-sun px-4 py-2 text-ink focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50">
        Skip to content
      </a>
      <div className="container-page flex h-[84px] items-center justify-between gap-6">
        <Link to="/" aria-label="Forkfast home" className="rounded-[10px]">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-10 lg:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={link}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="round inline-flex h-10 items-center gap-2 rounded-full px-3 text-[15px] text-white transition-colors hover:bg-white/10"
            aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
          >
            <ShoppingBag className="size-[18px] sm:hidden" aria-hidden />
            <span className="hidden sm:inline">Cart</span>
            <span className={cx('tabular-nums', bump && 'inline-block animate-pop text-sun')}>({count})</span>
          </button>
          <ButtonLink to="/orders" variant="outline-light" size="sm" className="px-6 max-sm:hidden">
            My orders
          </ButtonLink>
          <IconButton tone="outline-light" size="sm" aria-label="Open menu" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen}>
            <Menu aria-hidden />
          </IconButton>
        </div>
      </div>
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <nav aria-label="Mobile" className="flex flex-col p-4">
          {[...NAV, { to: '/orders', label: 'My orders' }].map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => cx('flex min-h-14 items-center rounded-[var(--radius-sm)] px-4 text-[18px] font-medium', isActive ? 'bg-lime-soft text-forest' : 'hover:bg-card')}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </Drawer>
    </header>
  )
}

/** The forest band that opens every inner page, continuing the nav. */
export function PageHeader({ title, body, children, crumb }: { title: ReactNode; body?: ReactNode; children?: ReactNode; crumb?: ReactNode }) {
  return (
    <section className="on-dark doodles relative overflow-hidden bg-forest text-white">
      <div className="container-page pt-8 pb-14 md:pt-12 md:pb-20">
        {crumb && <div className="mb-4 text-[14px] text-on-forest-muted">{crumb}</div>}
        <h1 className="max-w-[760px] text-[clamp(2.4rem,1.4rem+3vw,4rem)] leading-[1.04] font-bold">{title}</h1>
        {body && <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-on-forest-muted">{body}</p>}
        {children}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Cart drawer

export function FreeDeliveryMeter({ subtotal }: { subtotal: number }) {
  const left = Math.max(0, SITE.freeDeliveryOver - subtotal)
  const pct = Math.min(100, (subtotal / SITE.freeDeliveryOver) * 100)
  return (
    <div className="rounded-[var(--radius-sm)] bg-lime-soft p-4">
      <p className="flex items-center gap-2 text-[14px] font-medium text-forest">
        <Truck className="size-4" aria-hidden />
        {left > 0 ? <>Add {money(left)} more for free delivery</> : <>You have unlocked free delivery</>}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-label="Progress to free delivery" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
        <div className="h-full rounded-full bg-leaf transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function CartLineRow({ item, compact }: { item: ReturnType<typeof useStore>['items'][number]; compact?: boolean }) {
  const { setQuantity, remove } = useStore()
  const options = describeOptions(item.dish, item.size, item.extras)
  return (
    <li className="flex gap-4 py-4">
      <div className="flex size-20 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-card">
        <Photo name={item.dish.photo} className="size-16" alt="" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/menu/${item.slug}`} className="text-[15px] leading-snug font-semibold hover:underline max-sm:inline-flex max-sm:min-h-10 max-sm:items-center">
              {item.dish.name}
            </Link>
            {options && <p className="text-[13px] text-muted">{options}</p>}
            {item.notes && <p className="text-[13px] text-muted italic">“{item.notes}”</p>}
          </div>
          <span className="text-[15px] font-semibold tabular-nums">{money(item.unit * item.quantity)}</span>
        </div>
        {!compact && (
          <div className="mt-2 flex items-center justify-between">
            <QtyStepper size="sm" value={item.quantity} min={1} onChange={(q) => setQuantity(item.id, q)} label={`Quantity of ${item.dish.name}`} />
            <IconButton tone="ghost" size="sm" aria-label={`Remove ${item.dish.name}`} onClick={() => remove(item.id)} className="text-muted hover:text-tomato-ink">
              <Trash2 aria-hidden />
            </IconButton>
          </div>
        )}
        {compact && <p className="text-[13px] text-muted">Qty {item.quantity}</p>}
      </div>
    </li>
  )
}

export function CartDrawer() {
  const { items, count, subtotal, cartOpen, setCartOpen } = useStore()
  const navigate = useNavigate()
  const go = (to: string) => {
    setCartOpen(false)
    navigate(to)
  }
  return (
    <Drawer
      open={cartOpen}
      onClose={() => setCartOpen(false)}
      title={count ? `Your cart (${count})` : 'Your cart'}
      footer={
        items.length ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between text-[17px] font-semibold">
              <span>Subtotal</span>
              <span className="tabular-nums">{money(subtotal)}</span>
            </div>
            <p className="text-[13px] text-muted">Delivery, service fee and tax are added at checkout.</p>
            <Button variant="sun" size="lg" onClick={() => go('/checkout')}>
              Go to checkout
            </Button>
          </div>
        ) : undefined
      }
    >
      {items.length ? (
        <div className="px-6 py-4">
          <FreeDeliveryMeter subtotal={subtotal} />
          <ul className="mt-2 divide-y">
            {items.map((i) => (
              <CartLineRow key={i.id} item={i} />
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-6">
          <EmptyState
            icon={<UtensilsCrossed aria-hidden />}
            title="Your cart is empty"
            body="Pick a craving from the menu and it will show up here."
            action={
              <Button variant="leaf" onClick={() => go('/menu')}>
                Browse the menu
              </Button>
            }
          />
        </div>
      )}
    </Drawer>
  )
}

// ---------------------------------------------------------------------------
// Newsletter + footer

export function NewsletterForm({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [error, setError] = useState<string>()
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errors = validateSubscribe({ email })
    if (errors.email) return setError(errors.email)
    setError(undefined)
    setState('loading')
    const res = await postJson('/api/subscribe', { email })
    if (res.ok) setState('done')
    else {
      setState('idle')
      setError(res.fieldErrors?.email ?? res.error)
    }
  }
  if (state === 'done')
    return (
      <p role="status" className={cx('rounded-full px-5 py-3 text-[15px] font-medium', tone === 'dark' ? 'bg-white/10 text-white' : 'bg-lime-soft text-forest')}>
        You are on the list. First deal lands this week.
      </p>
    )
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <label htmlFor={`nl-${tone}`} className="sr-only">
          Email address
        </label>
        <Input
          id={`nl-${tone}`}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `nl-${tone}-err` : undefined}
          className="round min-w-[200px] flex-1 rounded-full"
        />
        <Button type="submit" variant="sun" loading={state === 'loading'} className="shrink-0">
          Subscribe
        </Button>
      </div>
      {error && (
        <p id={`nl-${tone}-err`} className={cx('pl-4 text-[13px]', tone === 'dark' ? 'text-sun' : 'text-tomato-ink')}>
          {error}
        </p>
      )}
    </form>
  )
}

export function Footer() {
  return (
    <footer className="on-dark doodles bg-forest text-white">
      <div className="container-page grid gap-12 pt-16 pb-10 md:grid-cols-[1.3fr_2fr]">
        <div className="flex flex-col gap-5">
          <Logo />
          <p className="max-w-[340px] text-[15px] leading-relaxed text-on-forest-muted">{FOOTER.blurb}</p>
          <div className="text-[14px] text-on-forest-muted">
            <p>{SITE.address}</p>
            <p>
              <a href={SITE.phoneHref} className="inline-flex min-h-10 items-center hover:text-white">
                {SITE.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${SITE.email}`} className="inline-flex min-h-10 items-center hover:text-white">
                {SITE.email}
              </a>
            </p>
          </div>
        </div>
        <div className="grid gap-10 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_1.6fr]">
          {FOOTER.columns.map((c) => (
            <div key={c.title}>
              <h2 className="mb-3 text-[15px] font-semibold text-sun">{c.title}</h2>
              <ul className="flex flex-col">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="inline-flex min-h-10 items-center text-[15px] text-on-forest-muted hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="sm:col-span-3 lg:col-span-1">
            <h2 className="mb-2 text-[15px] font-semibold text-sun">{FOOTER.newsletter.title}</h2>
            <p className="mb-4 text-[14px] text-on-forest-muted">{FOOTER.newsletter.body}</p>
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="container-page flex flex-col gap-2 border-t border-white/10 py-6 text-[13px] text-on-forest-muted sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {SITE.name}. Demo storefront: no payments are taken.
        </p>
        <p>
          {SITE.hours[0].days} {SITE.hours[0].time}
        </p>
      </div>
    </footer>
  )
}
