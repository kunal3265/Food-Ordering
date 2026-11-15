import { Bike, CreditCard, Plus, RotateCcw, Search, ShoppingBag, Store, Wallet, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'

import { BUTTON_VARIANTS, Button, ICON_TONES, IconButton, type ButtonVariant } from '../components/Button'
import { CategoryTile, DealCard, DishCard, PromoBurger, PromoFresh, PromoPizza, ReviewCard, SaveButton } from '../components/Cards'
import {
  AvatarStack,
  BADGE_TONES,
  Badge,
  Chip,
  Countdown,
  DishCardSkeleton,
  EmptyState,
  Logo,
  OrderNowLink,
  QtyStepper,
  RatingPill,
  SectionHeading,
  StarInput,
  Stars,
} from '../components/Display'
import { CheckRow, ChoiceGroup, Field, FormMessage, Input, Segmented, Select, Textarea } from '../components/Form'
import { FreeDeliveryMeter, NewsletterForm, PageHeader } from '../components/Layout'
import { Drawer, Modal, ToastPreview, useToast } from '../components/Overlay'
import { CATEGORIES, FLASH_DEALS, MENU, PROMO_CODES, REVIEWS } from '../data'
import { cx, useDocumentTitle } from '../lib/hooks'
import type { Order } from '../lib/store'
import { CouponCard } from './Offers'
import { OrderProgress } from './Orders'

// Mirrors @theme in src/styles.css
const COLORS = [
  { name: 'Forest', token: 'forest', hex: '#104a2f', use: 'Hero, nav, footer, dark bands' },
  { name: 'Forest 2', token: 'forest-2', hex: '#0b3923', use: 'Pressed green' },
  { name: 'Leaf', token: 'leaf', hex: '#17603c', use: 'Add buttons, links, focus ring' },
  { name: 'Leaf 2', token: 'leaf-2', hex: '#1d7449', use: 'Leaf hover' },
  { name: 'Sun', token: 'sun', hex: '#f7c32e', use: 'Primary CTA, display accent, badges' },
  { name: 'Sun 2', token: 'sun-2', hex: '#ffd659', use: 'Sun hover' },
  { name: 'Sun soft', token: 'sun-soft', hex: '#fde68a', use: 'Yellow promo, notices' },
  { name: 'Lime', token: 'lime', hex: '#c4e2a3', use: 'Category band' },
  { name: 'Lime soft', token: 'lime-soft', hex: '#e9f4dc', use: 'Selected rows, success' },
  { name: 'Tomato', token: 'tomato', hex: '#ef5a2f', use: 'Burger promo fill, large type only' },
  { name: 'Tomato ink', token: 'tomato-ink', hex: '#c03d17', use: 'Errors, small red text' },
  { name: 'Paper', token: 'paper', hex: '#ffffff', use: 'Page background' },
  { name: 'Card', token: 'card', hex: '#f4f4f1', use: 'Dish cards, image wells' },
  { name: 'Card 2', token: 'card-2', hex: '#ebebe6', use: 'Card hover' },
  { name: 'Line', token: 'line', hex: '#e4e5df', use: 'Hairlines' },
  { name: 'Line strong', token: 'line-strong', hex: '#cfd1c8', use: 'Input borders' },
  { name: 'Ink', token: 'ink', hex: '#121813', use: 'Text' },
  { name: 'Muted', token: 'muted', hex: '#535b55', use: 'Secondary text (AA on paper, card, lime)' },
  { name: 'Faint', token: 'faint', hex: '#9aa09b', use: 'Placeholders, decoration only' },
  { name: 'On forest muted', token: 'on-forest-muted', hex: '#c9d8cf', use: 'Body text on forest' },
]

function lum(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

const TYPE = [
  { label: 'Hero', spec: '96px / 700 / -0.03em', cls: 'text-[clamp(3.2rem,1.6rem+5.4vw,6rem)] leading-[1.02] font-bold tracking-[-0.03em]', sample: 'Delicious' },
  { label: 'Page title', spec: '64px / 700', cls: 'text-[clamp(2.4rem,1.4rem+3vw,4rem)] leading-[1.04] font-bold', sample: 'Menu & flavors' },
  { label: 'Section', spec: '42px / 600', cls: 'text-[clamp(1.9rem,1.2rem+1.8vw,2.6rem)] leading-[1.1] font-semibold', sample: 'Our top picks' },
  { label: 'Promo', spec: '38px / 700', cls: 'text-[38px] leading-[1.05] font-bold', sample: 'Loaded beef burgers' },
  { label: 'Card title', spec: '18px / 600', cls: 'text-[18px] font-semibold', sample: 'Fresh Garden Salad' },
  { label: 'Body', spec: '16px / 400 / 1.7', cls: 'text-[16px] leading-relaxed', sample: 'We connect hungry people with food worth waiting for.' },
  { label: 'Small', spec: '14px / 400', cls: 'text-[14px] text-muted', sample: 'Healthy Bites' },
  { label: 'Micro', spec: '12–13px / 500', cls: 'text-[13px] font-medium', sample: '18 min | 450 kcal' },
]

const SPACING = [4, 8, 12, 16, 24, 32, 40, 64, 96]
const RADII = [
  { name: 'xs', v: '10px' },
  { name: 'sm', v: '14px', use: 'Inputs, small tiles' },
  { name: 'md', v: '20px', use: 'Dish cards' },
  { name: 'lg', v: '28px', use: 'Promos, dialogs' },
  { name: 'xl', v: '40px', use: 'Bands' },
  { name: 'full', v: '9999px', use: 'Buttons, chips' },
]
const SHADOWS = ['card', 'float', 'drawer', 'food']
const MOTION = [
  { name: '--duration-fast', v: '150ms', use: 'Hover, press' },
  { name: '--duration-base', v: '260ms', use: 'Cards, nav underline' },
  { name: '--duration-slow', v: '520ms', use: 'Image zoom, meters' },
  { name: '--ease-out', v: 'cubic-bezier(.22,1,.36,1)', use: 'Everything that settles' },
  { name: '--ease-spring', v: 'cubic-bezier(.34,1.56,.64,1)', use: 'Cart count pop' },
]
const KEYFRAMES = ['animate-float', 'animate-spin-slow', 'animate-pop', 'animate-wiggle', 'animate-ping-soft']

const STATES = [
  { label: 'Default', force: undefined },
  { label: 'Hover', force: 'hover' },
  { label: 'Focus', force: 'focus' },
  { label: 'Pressed', force: 'pressed' },
] as const

function Block({ id, title, children, note }: { id: string; title: string; children: ReactNode; note?: string }) {
  return (
    <section id={id} className="scroll-mt-28 border-t py-12" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="text-[26px] font-semibold">
        {title}
      </h2>
      {note && <p className="mt-1 max-w-[640px] text-[15px] text-muted">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Cell({ label, children, dark }: { label: string; children: ReactNode; dark?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] font-medium text-muted">{label}</span>
      <div className={cx('flex min-h-16 items-center rounded-[var(--radius-sm)] p-3', dark ? 'on-dark bg-forest' : 'bg-card')}>{children}</div>
    </div>
  )
}

const DEMO_ORDER: Order = {
  reference: 'FF-DEMO1',
  createdAt: Date.now(),
  method: 'delivery',
  name: 'Sam',
  phone: '',
  slot: 'asap',
  payment: 'card',
  lines: [],
  quote: { subtotal: 0, discount: 0, deliveryFee: 0, serviceFee: 0, tax: 0, tip: 0, total: 0 },
}

const NAV = ['colours', 'type', 'spacing', 'radii', 'shadows', 'motion', 'buttons', 'badges', 'controls', 'forms', 'cards', 'feedback', 'overlays']

export function Styleguide() {
  useDocumentTitle('Style guide')
  const toast = useToast()
  const [replay, setReplay] = useState(0)
  const [qty, setQty] = useState(2)
  const [rating, setRating] = useState(4)
  const [method, setMethod] = useState<'delivery' | 'pickup'>('delivery')
  const [pay, setPay] = useState<'card' | 'wallet' | 'cash'>('card')
  const [seg, setSeg] = useState<'all' | 'veg' | 'spicy'>('all')
  const [check, setCheck] = useState(true)
  const [modal, setModal] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const dish = MENU[0]

  return (
    <>
      <PageHeader title="Style guide" body="The Forkfast design system, drawn with the real components. Hover, focus and pressed states are pinned with data-force.">
        <nav aria-label="Style guide sections" className="mt-8 flex flex-wrap gap-2">
          {NAV.map((n) => (
            <a key={n} href={`#${n}`} className="round inline-flex h-10 items-center rounded-full border border-white/30 px-4 text-[14px] capitalize hover:bg-white hover:text-forest">
              {n}
            </a>
          ))}
        </nav>
      </PageHeader>

      <div className="container-page pb-24">
        <Block id="colours" title="Colour" note="Contrast ratios are against ink text and white text. Tomato is for fills and display type only; small red text uses tomato ink.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {COLORS.map((c) => (
              <div key={c.token} className="overflow-hidden rounded-[var(--radius-md)] border">
                <div className="h-24" style={{ background: c.hex }} />
                <div className="p-3">
                  <p className="text-[14px] font-semibold">{c.name}</p>
                  <p className="font-mono text-[12px] text-muted">
                    {c.hex} --color-{c.token}
                  </p>
                  <p className="mt-1 text-[12px] text-muted">{c.use}</p>
                  <p className="mt-1 text-[12px] text-muted tabular-nums">
                    Ink {ratio(c.hex, '#121813').toFixed(1)}, white {ratio(c.hex, '#ffffff').toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Block>

        <Block id="type" title="Type" note="Outfit (Google Fonts), 400 to 800. Headings balance their lines.">
          <div className="flex flex-col divide-y">
            {TYPE.map((t) => (
              <div key={t.label} className="grid gap-2 py-4 md:grid-cols-[180px_1fr] md:items-baseline">
                <div>
                  <p className="text-[14px] font-semibold">{t.label}</p>
                  <p className="text-[12px] text-muted">{t.spec}</p>
                </div>
                <p className={cx(t.cls, 'min-w-0 truncate')}>{t.sample}</p>
              </div>
            ))}
          </div>
        </Block>

        <Block id="spacing" title="Spacing" note="Tailwind's 4px scale. Page gutters are clamp(16px, 5vw, 100px); sections are 96 to 112px apart on desktop.">
          <div className="flex flex-wrap items-end gap-5">
            {SPACING.map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div className="rounded-[4px] bg-leaf" style={{ width: s, height: s }} />
                <span className="text-[12px] text-muted">{s}px</span>
              </div>
            ))}
          </div>
        </Block>

        <Block id="radii" title="Radii" note="Squircle corners everywhere (corner-shape: squircle), one step larger than a plain radius. Circles opt out with .round.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {RADII.map((r) => (
              <div key={r.name} className="flex flex-col gap-2">
                <div className={cx('h-24 border-2 border-leaf bg-lime-soft', r.name === 'full' && 'round')} style={{ borderRadius: r.name === 'full' ? 9999 : `var(--radius-${r.name})` }} />
                <span className="text-[13px] font-medium">
                  {r.name} {r.v}
                </span>
                {r.use && <span className="text-[12px] text-muted">{r.use}</span>}
              </div>
            ))}
          </div>
        </Block>

        <Block id="shadows" title="Shadows">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {SHADOWS.map((s) => (
              <div key={s} className="flex h-28 items-end rounded-[var(--radius-md)] bg-white p-4 text-[13px] font-medium" style={{ boxShadow: `var(--shadow-${s})` }}>
                --shadow-{s}
              </div>
            ))}
          </div>
        </Block>

        <Block id="motion" title="Motion" note="Page fades, scroll reveals and the hero float. Everything non-essential stops under prefers-reduced-motion.">
          <div className="grid gap-8 lg:grid-cols-2">
            <dl className="flex flex-col divide-y">
              {MOTION.map((m) => (
                <div key={m.name} className="grid grid-cols-[1fr_1fr] gap-3 py-3 text-[14px]">
                  <dt className="font-mono text-[13px]">{m.name}</dt>
                  <dd>
                    {m.v} <span className="block text-[12px] text-muted">{m.use}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <div>
              <Button variant="outline" size="sm" icon={<RotateCcw className="size-4" aria-hidden />} onClick={() => setReplay((n) => n + 1)}>
                Replay
              </Button>
              <div key={replay} className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-5">
                {KEYFRAMES.map((k) => (
                  <div key={k} className="flex flex-col items-center gap-2">
                    <div className="flex size-20 items-center justify-center rounded-[var(--radius-md)] bg-card">
                      <span className={cx('round block size-8 rounded-full bg-sun', k)} />
                    </div>
                    <span className="text-center text-[11px] text-muted">{k}</span>
                  </div>
                ))}
              </div>
              <motion.div key={`r${replay}`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="mt-5 rounded-[var(--radius-md)] bg-lime-soft p-4 text-[14px]">
                Reveal: fade up 18px over 550ms with ease-out.
              </motion.div>
            </div>
          </div>
        </Block>

        <Block id="buttons" title="Buttons">
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Button variants and states">
            <table className="w-full min-w-[760px] border-separate border-spacing-2 text-left">
              <thead>
                <tr className="text-[12px] text-muted">
                  <th className="font-medium">Variant</th>
                  {[...STATES.map((s) => s.label), 'Disabled', 'Loading'].map((s) => (
                    <th key={s} className="font-medium">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BUTTON_VARIANTS.map((v: ButtonVariant) => (
                  <tr key={v}>
                    <td className="text-[13px] font-medium">{v}</td>
                    {STATES.map((s) => (
                      <td key={s.label} className={cx('rounded-[var(--radius-sm)] p-3', v === 'outline-light' ? 'on-dark bg-forest' : 'bg-card')}>
                        <Button variant={v} size="sm" force={s.force} tabIndex={-1}>
                          Order now
                        </Button>
                      </td>
                    ))}
                    <td className={cx('rounded-[var(--radius-sm)] p-3', v === 'outline-light' ? 'on-dark bg-forest' : 'bg-card')}>
                      <Button variant={v} size="sm" disabled>
                        Order now
                      </Button>
                    </td>
                    <td className={cx('rounded-[var(--radius-sm)] p-3', v === 'outline-light' ? 'on-dark bg-forest' : 'bg-card')}>
                      <Button variant={v} size="sm" loading>
                        Order now
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Cell label="Sizes: sm, md, lg">
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </Cell>
            <Cell label="With icons">
              <Button variant="leaf" icon={<ShoppingBag className="size-4" aria-hidden />}>
                Add to cart
              </Button>
            </Cell>
            <Cell label="Order now pill: default, hover, focus">
              <div className="flex flex-wrap gap-2">
                <OrderNowLink to="/menu">Order now</OrderNowLink>
                <OrderNowLink to="/menu" force="hover">
                  Order now
                </OrderNowLink>
                <OrderNowLink to="/menu" force="focus">
                  Order now
                </OrderNowLink>
              </div>
            </Cell>
          </div>
          <h3 className="mt-10 mb-3 text-[17px] font-semibold">Icon buttons</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ICON_TONES.map((t) => (
              <Cell key={t} label={t} dark={t === 'outline-light'}>
                <div className="flex gap-2">
                  {STATES.map((s) => (
                    <IconButton key={s.label} tone={t} size="sm" force={s.force} aria-label={`${t} ${s.label}`} tabIndex={-1}>
                      <Plus aria-hidden />
                    </IconButton>
                  ))}
                  <IconButton tone={t} size="sm" aria-label={`${t} disabled`} disabled>
                    <X aria-hidden />
                  </IconButton>
                </div>
              </Cell>
            ))}
          </div>
        </Block>

        <Block id="badges" title="Badges, ratings, avatars">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Cell label="Badge tones">
              <div className="flex flex-wrap gap-2">
                {BADGE_TONES.filter((t) => t !== 'forest').map((t) => (
                  <Badge key={t} tone={t}>
                    {t}
                  </Badge>
                ))}
              </div>
            </Cell>
            <Cell label="Badge on forest" dark>
              <Badge tone="forest">New this week</Badge>
            </Cell>
            <Cell label="Stars and rating pill">
              <div className="flex flex-wrap items-center gap-4">
                <Stars value={4.5} />
                <RatingPill value={4.8} />
              </div>
            </Cell>
            <Cell label="Avatar stack" dark>
              <AvatarStack count={4} />
            </Cell>
            <Cell label="Logo, light and dark">
              <div className="flex flex-wrap items-center gap-4">
                <Logo tone="dark" />
                <span className="on-dark rounded-[10px] bg-forest p-2">
                  <Logo />
                </span>
              </div>
            </Cell>
          </div>
        </Block>

        <Block id="controls" title="Controls">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Cell label="Chip: default, hover, focus, selected, disabled">
              <div className="flex flex-wrap gap-2">
                <Chip>Vegan</Chip>
                <Chip force="hover">Vegan</Chip>
                <Chip force="focus">Vegan</Chip>
                <Chip selected>Vegan</Chip>
                <Chip disabled>Vegan</Chip>
              </div>
            </Cell>
            <Cell label="Quantity: interactive, at minimum, disabled">
              <div className="flex flex-wrap gap-2">
                <QtyStepper value={qty} onChange={setQty} />
                <QtyStepper value={1} onChange={() => {}} size="sm" label="Min" />
                <QtyStepper value={3} onChange={() => {}} size="sm" disabled label="Disabled" />
              </div>
            </Cell>
            <Cell label="Countdown: live, ended">
              <div className="flex flex-wrap items-center gap-4">
                <Countdown seconds={6332} tone="white" />
                <Countdown seconds={6332} size="md" tone="white" />
                <Countdown seconds={0} />
              </div>
            </Cell>
            <Cell label="Segmented">
              <Segmented
                label="Diet"
                value={seg}
                onChange={setSeg}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'veg', label: 'Veg' },
                  { value: 'spicy', label: 'Spicy' },
                ]}
              />
            </Cell>
            <Cell label="Save heart: interactive, hover, focus">
              <span className="flex items-center gap-1">
                <SaveButton slug={dish.slug} name={dish.name} />
                <SaveButton slug={dish.slug} name={dish.name} force="hover" />
                <SaveButton slug={dish.slug} name={dish.name} force="focus" />
              </span>
            </Cell>
            <Cell label="Star input">
              <StarInput value={rating} onChange={setRating} name="sg-rating" />
            </Cell>
          </div>
        </Block>

        <Block id="forms" title="Forms">
          <div className="grid gap-6 lg:grid-cols-3">
            <Field label="Default">
              <Input placeholder="you@example.com" />
            </Field>
            <Field label="Focus">
              <Input force="focus" defaultValue="Priya S." />
            </Field>
            <Field label="Hover">
              <Input force="hover" defaultValue="218 Valencia Street" />
            </Field>
            <Field label="Error" error="Enter a 5-digit ZIP code.">
              <Input defaultValue="941" />
            </Field>
            <Field label="Disabled">
              <Input disabled defaultValue="San Francisco" />
            </Field>
            <Field label="With hint" hint="Only for the rider." optional>
              <Input type="tel" />
            </Field>
            <Field label="Select">
              <Select defaultValue="asap">
                <option value="asap">As soon as possible</option>
                <option value="18:00">Today at 18:00</option>
              </Select>
            </Field>
            <Field label="Search">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
                <Input className="pl-10" placeholder="Search the menu" />
              </div>
            </Field>
            <Field label="Textarea">
              <Textarea rows={3} placeholder="Gate code, floor..." />
            </Field>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ChoiceGroup
              legend="Choice cards (delivery method)"
              value={method}
              onChange={setMethod}
              options={[
                { value: 'delivery', label: 'Delivery', detail: '25 to 35 min', icon: <Bike aria-hidden /> },
                { value: 'pickup', label: 'Pickup', detail: 'Ready in 12 to 18 min', icon: <Store aria-hidden /> },
              ]}
            />
            <ChoiceGroup
              legend="Choice cards with error and disabled option"
              value={pay}
              onChange={setPay}
              columns={3}
              error="Choose how you want to pay."
              options={[
                { value: 'card', label: 'Card', icon: <CreditCard aria-hidden /> },
                { value: 'wallet', label: 'Wallet', icon: <Wallet aria-hidden /> },
                { value: 'cash', label: 'Cash', disabled: true },
              ]}
            />
            <div className="-mx-3">
              <CheckRow checked={check} onChange={setCheck} label="Extra cheese" aside="+₹79" />
              <CheckRow checked={false} onChange={() => {}} label="Smoked bacon (disabled)" aside="+₹149" disabled />
            </div>
            <div className="flex flex-col gap-3">
              <FormMessage tone="error">We could not reach the kitchen. Check your connection and try again.</FormMessage>
              <FormMessage tone="success">Thanks! Your review is live below.</FormMessage>
            </div>
            <div className="on-dark rounded-[var(--radius-md)] bg-forest p-5">
              <p className="mb-3 text-[14px] font-medium text-white">Newsletter form (on forest)</p>
              <NewsletterForm />
            </div>
            <div className="rounded-[var(--radius-md)] border p-5">
              <p className="mb-3 text-[14px] font-medium">Newsletter form (light)</p>
              <NewsletterForm tone="light" />
            </div>
          </div>
        </Block>

        <Block id="cards" title="Cards" note="Dish cards lift on hover; the whole card is one link and the add button sits above it.">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
            <div>
              <p className="mb-2 text-[12px] font-medium text-muted">Dish card</p>
              <DishCard dish={dish} />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-muted">Hover, saveable, on deal</p>
              <DishCard dish={MENU.find((d) => d.slug === FLASH_DEALS[3].slug)!} force="hover" saveable />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-muted">Loading</p>
              <DishCardSkeleton />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-muted">Flash deal: ended</p>
              <DealCard deal={FLASH_DEALS[1]} featured secondsOverride={0} />
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
            <div>
              <p className="mb-2 text-[12px] font-medium text-muted">Flash deal: compact</p>
              <DealCard deal={FLASH_DEALS[0]} />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-muted">Review</p>
              <ReviewCard review={REVIEWS[0]} />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-muted">Coupon</p>
              <CouponCard promo={PROMO_CODES[0]} />
            </div>
          </div>
          <p className="mt-8 mb-2 text-[12px] font-medium text-muted">Category tile: default, hover, focus, selected</p>
          <div className="flex flex-wrap gap-4 rounded-[var(--radius-md)] bg-lime p-6">
            <CategoryTile category={CATEGORIES[0]} onClick={() => {}} />
            <CategoryTile category={CATEGORIES[1]} onClick={() => {}} force="hover" />
            <CategoryTile category={CATEGORIES[2]} onClick={() => {}} force="focus" />
            <CategoryTile category={CATEGORIES[3]} onClick={() => {}} selected />
          </div>
          <p className="mt-8 mb-2 text-[12px] font-medium text-muted">Promo cards</p>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="grid gap-6">
              <PromoFresh />
              <PromoPizza />
            </div>
            <PromoBurger />
          </div>
          <div className="mt-8">
            <SectionHeading align="split" title="Section heading, split" body="Body copy sits on the right on desktop and below on mobile." />
          </div>
        </Block>

        <Block id="feedback" title="Feedback and progress">
          <div className="grid gap-6 lg:grid-cols-2">
            <EmptyState icon={<ShoppingBag aria-hidden />} title="Your cart is empty" body="Pick a craving from the menu and it will show up here." action={<Button variant="leaf">Browse the menu</Button>} />
            <div className="flex flex-col gap-4">
              <FreeDeliveryMeter subtotal={18.5} />
              <FreeDeliveryMeter subtotal={34} />
              <ToastPreview>Added Signature Smash Burger</ToastPreview>
              <Button variant="outline" size="sm" className="self-start" onClick={() => toast('This is a live toast.')}>
                Show a toast
              </Button>
            </div>
          </div>
          <div className="mt-8 rounded-[var(--radius-lg)] border p-6">
            <p className="mb-4 text-[12px] font-medium text-muted">Order progress (stage 2 of 5)</p>
            <OrderProgress order={DEMO_ORDER} stage={1} />
          </div>
        </Block>

        <Block id="overlays" title="Overlays" note="Focus moves in, Tab is trapped, Escape closes and focus returns to the button that opened it.">
          <div className="flex flex-wrap gap-3">
            <Button variant="leaf" onClick={() => setModal(true)}>
              Open modal
            </Button>
            <Button variant="outline" onClick={() => setDrawer(true)}>
              Open drawer
            </Button>
          </div>
          <Modal
            open={modal}
            onClose={() => setModal(false)}
            title="Leave a tip?"
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setModal(false)}>
                  Not now
                </Button>
                <Button variant="sun" onClick={() => setModal(false)}>
                  Add ₹249 tip
                </Button>
              </div>
            }
          >
            <p className="text-[15px] text-muted">Every rupee goes to your rider. You can change it at checkout.</p>
          </Modal>
          <Drawer open={drawer} onClose={() => setDrawer(false)} title="Drawer">
            <div className="p-6 text-[15px] text-muted">The cart and the mobile menu use this drawer.</div>
          </Drawer>
        </Block>
      </div>
    </>
  )
}
