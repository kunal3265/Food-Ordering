import { Bike, Check, ChefHat, Package, PartyPopper, Phone, Receipt, RotateCcw, Store, Utensils } from 'lucide-react'
import { motion } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'

import { Button, ButtonLink } from '../components/Button'
import { Badge, EmptyState, Row } from '../components/Display'
import { useToast } from '../components/Overlay'
import { PageHeader } from '../components/Layout'
import { SITE, bySlug } from '../data'
import { cx, useDocumentTitle, useNow } from '../lib/hooks'
import { STAGES, orderStage, secondsLeft, stageLabel, useStore, type Order } from '../lib/store'
import { money } from '../shared/pricing'

const ICONS = [Receipt, ChefHat, Package, Bike, PartyPopper]

const when = (t: number) => new Date(t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

function useReorder() {
  const { add, setCartOpen } = useStore()
  const toast = useToast()
  return (order: Order) => {
    let n = 0
    for (const l of order.lines) {
      const dish = bySlug(l.slug)
      if (!dish) continue
      add(dish, { quantity: l.quantity })
      n += l.quantity
    }
    toast(`Added ${n} item${n === 1 ? '' : 's'} to your cart`)
    setCartOpen(true)
  }
}

export function StatusBadge({ order, now }: { order: Order; now: number }) {
  const stage = orderStage(order, now)
  return (
    <Badge tone={stage === 4 ? 'neutral' : stage === 3 ? 'sun' : 'lime'}>
      {stage < 4 && <span className="round size-1.5 rounded-full bg-current motion-safe:animate-pulse" aria-hidden />}
      {stageLabel(order, stage)}
    </Badge>
  )
}

/** Vertical (mobile) / horizontal (desktop) order progress. */
export function OrderProgress({ order, stage }: { order: Order; stage: number }) {
  const stages = STAGES.filter((s) => order.method === 'delivery' || s.id !== 'onTheWay')
  const current = stages.findIndex((s) => s.id === STAGES[stage].id)
  return (
    <ol className="grid gap-4 md:grid-cols-[repeat(var(--n),minmax(0,1fr))] md:gap-0" style={{ ['--n' as string]: stages.length }}>
      {stages.map((s, i) => {
        const Icon = ICONS[STAGES.indexOf(s)]
        const done = i < current || current === stages.length - 1
        const active = i === current && current !== stages.length - 1
        const label = s.id === 'ready' && order.method === 'pickup' ? 'Ready to collect' : s.id === 'delivered' && order.method === 'pickup' ? 'Collected' : s.label
        return (
          <li key={s.id} className="relative flex items-center gap-4 md:flex-col md:items-start md:gap-3" aria-current={active ? 'step' : undefined}>
            {i > 0 && (
              <span className="absolute top-[-16px] left-[23px] h-4 w-0.5 bg-line md:top-[23px] md:right-[calc(100%-0px)] md:left-[-100%] md:h-0.5 md:w-full" aria-hidden>
                <span className={cx('block size-full origin-left bg-leaf transition-transform duration-[var(--duration-slow)]', i <= current ? 'scale-100' : 'scale-0')} />
              </span>
            )}
            <span
              className={cx(
                'round relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full transition-colors duration-[var(--duration-base)]',
                done && 'bg-leaf text-white',
                active && 'bg-sun text-ink',
                !done && !active && 'bg-card text-faint',
              )}
            >
              {active && <span className="round absolute inset-0 rounded-full bg-sun motion-safe:animate-ping-soft" aria-hidden />}
              {done ? <Check className="relative size-5" strokeWidth={3} aria-hidden /> : <Icon className="relative size-5" aria-hidden />}
            </span>
            <span className="md:pr-4">
              <span className={cx('block text-[15px] font-semibold', !done && !active && 'text-muted')}>{label}</span>
              <span className="block text-[13px] text-muted">{done || active ? s.detail : 'Up next'}</span>
            </span>
            <span className="sr-only">{done ? '(done)' : active ? '(in progress)' : '(not started)'}</span>
          </li>
        )
      })}
    </ol>
  )
}

/** Illustrated route from the kitchen to the door; the rider moves with the order. */
function RouteMap({ progress, method }: { progress: number; method: Order['method'] }) {
  const path = 'M60 220 C 140 220, 150 120, 240 120 S 340 60, 420 70 S 520 140, 560 80'
  const ref = useRef<SVGPathElement>(null)
  const [pt, setPt] = useState({ x: 60, y: 220 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const p = el.getPointAtLength(el.getTotalLength() * progress)
    setPt({ x: p.x, y: p.y })
  }, [progress])
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] bg-lime-soft">
      <svg viewBox="0 0 620 280" className="w-full" role="img" aria-label={method === 'delivery' ? 'Map showing the rider between the kitchen and your address' : 'Map of the pickup counter'}>
        <defs>
          <pattern id="blocks" width="70" height="70" patternUnits="userSpaceOnUse">
            <rect x="6" y="6" width="58" height="58" rx="10" fill="#fff" opacity=".7" />
          </pattern>
        </defs>
        <rect width="620" height="280" fill="url(#blocks)" />
        <path d="M0 160 H620 M300 0 V280" stroke="#d6e9c2" strokeWidth="16" />
        {method === 'delivery' && (
          <>
            <path ref={ref} d={path} fill="none" stroke="var(--color-forest)" strokeOpacity=".18" strokeWidth="10" strokeLinecap="round" />
            <motion.path d={path} fill="none" stroke="var(--color-leaf)" strokeWidth="10" strokeLinecap="round" initial={false} animate={{ pathLength: progress }} transition={{ duration: 1 }} />
            <circle cx="560" cy="80" r="18" fill="var(--color-tomato)" />
            <path d="M552 80l6 6 10-12" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </>
        )}
        <circle cx="60" cy="220" r="18" fill="var(--color-forest)" />
        <path d="M53 213v8a4 4 0 0 0 4 4v8M61 213v20M66 213c-2 0-3 3-3 7 0 2 1 3 3 3v10" stroke="#f7c32e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {method === 'delivery' && progress > 0.03 && progress < 1 && (
          <motion.g initial={false} animate={{ x: pt.x, y: pt.y }} transition={{ duration: 1, ease: 'easeOut' }}>
            <circle r="22" fill="var(--color-sun)" stroke="#fff" strokeWidth="4" />
            <Bike x={-11} y={-11} width={22} height={22} color="var(--color-ink)" />
          </motion.g>
        )}
      </svg>
    </div>
  )
}

export function OrderTracking() {
  const { reference = '' } = useParams()
  const [params] = useSearchParams()
  const { orders } = useStore()
  const now = useNow(1000)
  const reorder = useReorder()
  const order = orders.find((o) => o.reference === reference)
  useDocumentTitle(order ? `Order ${order.reference}` : 'Order not found')

  if (!order)
    return (
      <>
        <PageHeader title="Order not found" />
        <div className="container-page py-16">
          <EmptyState
            icon={<Receipt aria-hidden />}
            title={`We can not find ${reference}`}
            body="Orders are kept on the device you ordered from. Check the link, or see your recent orders."
            action={
              <ButtonLink to="/orders" variant="leaf">
                My orders
              </ButtonLink>
            }
          />
        </div>
      </>
    )

  const stage = orderStage(order, now)
  const left = secondsLeft(order, now)
  const done = stage === 4
  // Map progress: the rider leaves at "on the way" and arrives at "delivered".
  const progress = stage < 3 ? 0.02 : stage === 4 ? 1 : Math.min(0.95, Math.max(0.05, ((now - order.createdAt) / 1000 - 110) / 90))
  const firstDish = order.lines[0]

  return (
    <>
      <PageHeader
        crumb={
          <Link to="/orders" className="inline-flex min-h-10 items-center hover:text-white">
            My orders
          </Link>
        }
        title={params.get('placed') && !done ? `Thanks, ${order.name.split(' ')[0]}. It is cooking.` : done ? (order.method === 'pickup' ? 'Collected. Enjoy!' : 'Delivered. Enjoy!') : stageLabel(order, stage)}
        body={
          <>
            Order <span className="font-semibold text-white">{order.reference}</span>, placed {when(order.createdAt)}.{' '}
            {!done && <>Estimated {Math.ceil(left / 60)} min left in this demo.</>}
          </>
        }
      />
      <div className="container-page grid gap-8 py-12 lg:grid-cols-[1.6fr_1fr] lg:py-16">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="progress" className="rounded-[var(--radius-lg)] border p-6 md:p-8">
            <h2 id="progress" className="sr-only">
              Progress
            </h2>
            <div aria-live="polite">
              <OrderProgress order={order} stage={stage} />
            </div>
          </section>
          <RouteMap progress={progress} method={order.method} />
          {done && firstDish && (
            <div className="flex flex-col items-start gap-4 rounded-[var(--radius-lg)] bg-sun-soft p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[18px] font-semibold">How was it?</h2>
                <p className="text-[15px] text-muted">A quick rating helps the kitchen and the next hungry person.</p>
              </div>
              {order.review ? (
                <Badge tone="leaf">Thanks for your review</Badge>
              ) : (
                <ButtonLink to={`/reviews?dish=${firstDish.slug}&order=${order.reference}#write`} variant="leaf">
                  Rate your order
                </ButtonLink>
              )}
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-6" aria-label="Order details">
          <section className="rounded-[var(--radius-lg)] bg-card p-6">
            <h2 className="text-[18px] font-semibold">{order.method === 'delivery' ? 'Delivering to' : 'Collect from'}</h2>
            <p className="mt-2 flex items-start gap-2 text-[15px]">
              {order.method === 'delivery' ? <Bike className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden /> : <Store className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden />}
              {order.address ?? SITE.address}
            </p>
            <p className="mt-2 flex items-center gap-2 text-[15px] text-muted">
              <Phone className="size-4 text-leaf" aria-hidden />
              Questions? <a href={SITE.phoneHref} className="inline-flex min-h-10 items-center font-medium text-ink hover:underline">{SITE.phone}</a>
            </p>
          </section>
          <section className="rounded-[var(--radius-lg)] bg-card p-6">
            <h2 className="text-[18px] font-semibold">Receipt</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {order.lines.map((l, i) => (
                <li key={i} className="flex justify-between gap-3 text-[15px]">
                  <span>
                    <span className="font-medium">{l.quantity} × {l.name}</span>
                    {l.options && <span className="block text-[13px] text-muted">{l.options}</span>}
                  </span>
                  <span className="tabular-nums">{money(l.unit * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 flex flex-col gap-2 border-t border-line-strong/60 pt-4">
              <Row label="Subtotal" value={money(order.quote.subtotal)} />
              {order.quote.discount > 0 && <Row label={`Discount (${order.quote.promo})`} value={`−${money(order.quote.discount)}`} tone="discount" />}
              {order.method === 'delivery' && <Row label="Delivery" value={order.quote.deliveryFee ? money(order.quote.deliveryFee) : 'Free'} />}
              <Row label="Service fee and tax" value={money(order.quote.serviceFee + order.quote.tax)} />
              {order.quote.tip > 0 && <Row label="Rider tip" value={money(order.quote.tip)} />}
              <Row label="Total" value={money(order.quote.total)} strong className="mt-1 border-t border-line-strong/60 pt-3" />
            </dl>
            <Button variant="outline" className="mt-5 w-full" icon={<RotateCcw className="size-4" aria-hidden />} onClick={() => reorder(order)}>
              Order this again
            </Button>
          </section>
        </aside>
      </div>
    </>
  )
}

export function Orders() {
  useDocumentTitle('My orders')
  const { orders } = useStore()
  const now = useNow(5000)
  const reorder = useReorder()
  const active = orders.filter((o) => orderStage(o, now) < 4)
  const past = orders.filter((o) => orderStage(o, now) === 4)

  const card = (o: Order) => (
    <li key={o.reference} className="flex flex-col gap-4 rounded-[var(--radius-md)] border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[16px] font-semibold">{o.reference}</span>
          <StatusBadge order={o} now={now} />
        </div>
        <p className="mt-1 truncate text-[14px] text-muted">{o.lines.map((l) => `${l.quantity} × ${l.name}`).join(', ')}</p>
        <p className="mt-1 text-[13px] text-muted">
          {when(o.createdAt)}, {o.method === 'delivery' ? 'delivery' : 'pickup'}, {money(o.quote.total)}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="ghost" size="sm" onClick={() => reorder(o)} icon={<RotateCcw className="size-4" aria-hidden />}>
          Reorder
        </Button>
        <ButtonLink to={`/orders/${o.reference}`} variant={orderStage(o, now) < 4 ? 'leaf' : 'outline'} size="sm">
          {orderStage(o, now) < 4 ? 'Track order' : 'View receipt'}
        </ButtonLink>
      </div>
    </li>
  )

  return (
    <>
      <PageHeader title="My orders" body="Orders placed on this device. Track one that is on its way, or reorder a favourite in one tap." />
      <div className="container-page flex flex-col gap-12 py-12 lg:py-16">
        {orders.length === 0 ? (
          <EmptyState
            icon={<Utensils aria-hidden />}
            title="No orders yet"
            body="When you place an order it shows up here, with live tracking until it reaches you."
            action={
              <ButtonLink to="/menu" variant="leaf">
                Start an order
              </ButtonLink>
            }
          />
        ) : (
          <>
            {active.length > 0 && (
              <section aria-labelledby="active">
                <h2 id="active" className="mb-4 text-[22px] font-semibold">
                  In progress
                </h2>
                <ul className="flex flex-col gap-3">{active.map(card)}</ul>
              </section>
            )}
            {past.length > 0 && (
              <section aria-labelledby="past">
                <h2 id="past" className="mb-4 text-[22px] font-semibold">
                  Past orders
                </h2>
                <ul className="flex flex-col gap-3">{past.map(card)}</ul>
              </section>
            )}
          </>
        )}
      </div>
    </>
  )
}
