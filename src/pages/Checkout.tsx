import { Banknote, Bike, CreditCard, Lock, ShoppingBag, Store, TicketPercent, Wallet, X } from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'

import { Button, ButtonLink } from '../components/Button'
import { EmptyState, Row } from '../components/Display'
import { ChoiceGroup, Field, FormMessage, Input, Select, Textarea } from '../components/Form'
import { CartLineRow, FreeDeliveryMeter, PageHeader } from '../components/Layout'
import { SITE } from '../data'
import { postJson, useDocumentTitle } from '../lib/hooks'
import { describeOptions, useStore, type Order } from '../lib/store'
import { money, quote, type Method, type Quote } from '../shared/pricing'
import { SLOTS, TIPS, validateCard, validateOrder, type FieldErrors, type Payment } from '../shared/validation'

const DETAILS_KEY = 'forkfast-details'

interface Details {
  name: string
  email: string
  phone: string
  street: string
  city: string
  zip: string
  instructions: string
}

function loadDetails(): Details {
  const empty = { name: '', email: '', phone: '', street: '', city: 'Vijayawada', zip: '', instructions: '' }
  try {
    return { ...empty, ...(JSON.parse(localStorage.getItem(DETAILS_KEY) ?? '{}') as Partial<Details>) }
  } catch {
    return empty
  }
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-[var(--radius-lg)] border p-6 md:p-8" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="mb-5 flex items-center gap-3 text-[20px] font-semibold">
        <span className="round flex size-8 items-center justify-center rounded-full bg-forest text-[14px] text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

const slotLabel = (s: string) => (s === 'asap' ? 'As soon as possible' : `Today at ${s}`)

export function Checkout() {
  useDocumentTitle('Checkout')
  const { items, subtotal, clear, addOrder } = useStore()
  const navigate = useNavigate()
  const [method, setMethod] = useState<Method>('delivery')
  const [d, setD] = useState<Details>(loadDetails)
  const [slot, setSlot] = useState<string>('asap')
  const [payment, setPayment] = useState<Payment>('card')
  const [card, setCard] = useState({ cardNumber: '', cardExpiry: '', cardCvc: '' })
  const [tip, setTip] = useState<number>(150)
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<string>()
  const [promoState, setPromoState] = useState<{ loading?: boolean; error?: string }>({})
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const lines = useMemo(() => items.map((i) => ({ slug: i.slug, size: i.size, extras: i.extras, quantity: i.quantity })), [items])
  const q: Quote = quote(lines, method, promo, method === 'delivery' ? tip : 0)
  // A code that stops applying (cart shrank, switched to pickup) shows why.
  const promoLapsed = promo && q.promoError

  const set = (k: keyof Details) => (e: { target: { value: string } }) => setD((prev) => ({ ...prev, [k]: e.target.value }))

  const applyPromo = async (e?: { preventDefault(): void }) => {
    e?.preventDefault()
    if (!promoInput.trim()) return setPromoState({ error: 'Enter a code.' })
    setPromoState({ loading: true })
    const res = await postJson<{ code: string }>('/api/promo', { code: promoInput, lines, method })
    if (res.ok) {
      setPromo(res.data.code)
      setPromoInput('')
      setPromoState({})
    } else setPromoState({ error: res.fieldErrors?.code ?? res.fieldErrors?.lines ?? res.error })
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(undefined)
    const body = { ...d, method, slot, payment, tip: method === 'delivery' ? tip : 0, lines, promo: promoLapsed ? undefined : promo }
    const local = { ...validateOrder(body), ...(payment === 'card' ? validateCard(card) : {}) }
    if (Object.keys(local).length) {
      setErrors(local)
      setFormError('Please check the highlighted fields.')
      window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 30)
      return
    }
    setErrors({})
    setSubmitting(true)
    const res = await postJson<{ reference: string; quote: Order['quote'] }>('/api/orders', body)
    setSubmitting(false)
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {})
      setFormError(res.error)
      return
    }
    try {
      localStorage.setItem(DETAILS_KEY, JSON.stringify(d))
    } catch {
      /* storage unavailable */
    }
    addOrder({
      reference: res.data.reference,
      createdAt: Date.now(),
      method,
      name: d.name.trim(),
      phone: d.phone.trim(),
      address: method === 'delivery' ? `${d.street.trim()}, ${d.city.trim()} ${d.zip.trim()}` : undefined,
      slot,
      payment,
      lines: items.map((i) => ({ slug: i.slug, name: i.dish.name, quantity: i.quantity, unit: i.unit, options: describeOptions(i.dish, i.size, i.extras) })),
      quote: res.data.quote,
    })
    clear()
    navigate(`/orders/${res.data.reference}?placed=1`)
  }

  if (!items.length)
    return (
      <>
        <PageHeader title="Checkout" />
        <div className="container-page py-16">
          <EmptyState
            icon={<ShoppingBag aria-hidden />}
            title="Nothing to check out yet"
            body="Your cart is empty. Add a few dishes and come back here to order."
            action={
              <ButtonLink to="/menu" variant="leaf">
                Browse the menu
              </ButtonLink>
            }
          />
        </div>
      </>
    )

  return (
    <>
      <PageHeader title="Checkout" body="Demo checkout: your order is checked and priced by the server, and no payment is taken." />
      <form onSubmit={submit} noValidate className="container-page grid gap-8 py-12 lg:grid-cols-[1.5fr_1fr] lg:gap-10 lg:py-16">
        <div className="flex flex-col gap-6">
          <Section n={1} title="Delivery or pickup">
            <ChoiceGroup
              legend="How do you want your order?"
              hideLegend
              value={method}
              onChange={setMethod}
              error={errors.method}
              options={[
                { value: 'delivery', label: 'Delivery', detail: `${SITE.deliveryMinutes[0]} to ${SITE.deliveryMinutes[1]} min`, icon: <Bike aria-hidden /> },
                { value: 'pickup', label: 'Pickup', detail: `Ready in ${SITE.pickupMinutes[0]} to ${SITE.pickupMinutes[1]} min`, icon: <Store aria-hidden /> },
              ]}
            />
          </Section>

          <Section n={2} title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name} className="sm:col-span-2">
                <Input autoComplete="name" value={d.name} onChange={set('name')} />
              </Field>
              <Field label="Email" error={errors.email}>
                <Input type="email" autoComplete="email" value={d.email} onChange={set('email')} />
              </Field>
              <Field label="Phone" error={errors.phone} hint="Only for the rider.">
                <Input type="tel" autoComplete="tel" value={d.phone} onChange={set('phone')} />
              </Field>
            </div>
          </Section>

          {method === 'delivery' ? (
            <Section n={3} title="Delivery address">
              <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                <Field label="Street address" error={errors.street} className="sm:col-span-2">
                  <Input autoComplete="street-address" value={d.street} onChange={set('street')} />
                </Field>
                <Field label="City" error={errors.city}>
                  <Input autoComplete="address-level2" value={d.city} onChange={set('city')} />
                </Field>
                <Field label="ZIP code" error={errors.zip}>
                  <Input autoComplete="postal-code" inputMode="numeric" value={d.zip} onChange={set('zip')} />
                </Field>
                <Field label="Instructions for the rider" optional error={errors.instructions} className="sm:col-span-2">
                  <Textarea rows={2} className="min-h-20" value={d.instructions} onChange={set('instructions')} placeholder="Gate code, floor, leave at the door..." />
                </Field>
              </div>
            </Section>
          ) : (
            <Section n={3} title="Pickup from">
              <p className="text-[16px] font-medium">{SITE.address}</p>
              <p className="mt-1 text-[14px] text-muted">Show your order number at the counter.</p>
            </Section>
          )}

          <Section n={4} title="When">
            <Field label="Time" error={errors.slot}>
              <Select value={slot} onChange={(e) => setSlot(e.target.value)}>
                {SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {slotLabel(s)}
                  </option>
                ))}
              </Select>
            </Field>
          </Section>

          <Section n={5} title="Payment">
            <ChoiceGroup
              legend="Pay with"
              hideLegend
              value={payment}
              onChange={setPayment}
              columns={3}
              error={errors.payment}
              options={[
                { value: 'card', label: 'Card', icon: <CreditCard aria-hidden /> },
                { value: 'wallet', label: 'Wallet', detail: 'Apple or Google Pay', icon: <Wallet aria-hidden /> },
                { value: 'cash', label: method === 'delivery' ? 'Cash' : 'At the counter', icon: <Banknote aria-hidden /> },
              ]}
            />
            {payment === 'card' && (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-[2fr_1fr_1fr]">
                <Field label="Card number" error={errors.cardNumber} className="col-span-2 sm:col-span-1" hint="Demo: try 4242 4242 4242 4242.">
                  <Input
                    inputMode="numeric"
                    autoComplete="off"
                    value={card.cardNumber}
                    onChange={(e) =>
                      setCard((c) => ({
                        ...c,
                        cardNumber: e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 16)
                          .replace(/(\d{4})(?=\d)/g, '$1 '),
                      }))
                    }
                    placeholder="1234 5678 9012 3456"
                  />
                </Field>
                <Field label="Expiry" error={errors.cardExpiry}>
                  <Input
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="MM/YY"
                    value={card.cardExpiry}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setCard((c) => ({ ...c, cardExpiry: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v }))
                    }}
                  />
                </Field>
                <Field label="CVC" error={errors.cardCvc}>
                  <Input inputMode="numeric" autoComplete="off" value={card.cardCvc} onChange={(e) => setCard((c) => ({ ...c, cardCvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                </Field>
                <p className="col-span-2 flex items-center gap-2 text-[13px] text-muted sm:col-span-3">
                  <Lock className="size-3.5" aria-hidden />
                  Card details are checked in your browser and never sent anywhere.
                </p>
              </div>
            )}
            {method === 'delivery' && (
              <div className="mt-6">
                <ChoiceGroup
                  legend="Tip your rider (all of it goes to them)"
                  value={String(tip)}
                  onChange={(v) => setTip(Number(v))}
                  columns={4}
                  size="sm"
                  error={errors.tip}
                  options={TIPS.map((t) => ({ value: String(t), label: t ? money(t) : 'No tip' }))}
                />
              </div>
            )}
          </Section>
        </div>

        <aside className="lg:sticky lg:top-[108px] lg:self-start" aria-label="Order summary">
          <div className="rounded-[var(--radius-lg)] bg-card p-6 md:p-7">
            <h2 className="text-[20px] font-semibold">Your order</h2>
            <ul className="mt-2 divide-y divide-line-strong/60">
              {items.map((i) => (
                <CartLineRow key={i.id} item={i} compact />
              ))}
            </ul>
            {method === 'delivery' && (
              <div className="mt-3">
                <FreeDeliveryMeter subtotal={subtotal} />
              </div>
            )}

            <div className="mt-5 border-t border-line-strong/60 pt-5">
              {promo ? (
                <div className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] bg-white px-4 py-3">
                  <span className="flex items-center gap-2 text-[14px] font-medium">
                    <TicketPercent className="size-4 text-leaf" aria-hidden />
                    {promo}
                    {q.promo && <span className="font-normal text-muted">{q.promo.title}</span>}
                  </span>
                  <button type="button" onClick={() => setPromo(undefined)} className="round inline-flex size-10 items-center justify-center rounded-full hover:bg-card" aria-label={`Remove code ${promo}`}>
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="promo" className="text-[14px] font-medium">
                    Promo code
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="promo"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') applyPromo(e)
                      }}
                      placeholder="FIRSTBITE"
                      aria-invalid={promoState.error ? true : undefined}
                      aria-describedby={promoState.error ? 'promo-err' : undefined}
                    />
                    <Button variant="outline" onClick={() => applyPromo()} loading={promoState.loading} className="shrink-0">
                      Apply
                    </Button>
                  </div>
                  {promoState.error && (
                    <p id="promo-err" className="text-[13px] text-tomato-ink">
                      {promoState.error}
                    </p>
                  )}
                </div>
              )}
              {promoLapsed && <p className="mt-2 text-[13px] text-tomato-ink">{q.promoError}</p>}
              {errors.promo && <p className="mt-2 text-[13px] text-tomato-ink">{errors.promo}</p>}
            </div>

            <dl className="mt-5 flex flex-col gap-2.5 border-t border-line-strong/60 pt-5">
              <Row label="Subtotal" value={money(q.subtotal)} />
              {q.discount > 0 && <Row label="Discount" value={`−${money(q.discount)}`} tone="discount" />}
              {method === 'delivery' && <Row label="Delivery" value={q.deliveryFee ? money(q.deliveryFee) : 'Free'} />}
              <Row label="Service fee" value={money(q.serviceFee)} />
              <Row label="GST" value={money(q.tax)} />
              {q.tip > 0 && <Row label="Rider tip" value={money(q.tip)} />}
              <Row label="Total" value={money(q.total)} strong className="mt-2 border-t border-line-strong/60 pt-3" />
            </dl>

            <div className="mt-6 flex flex-col gap-3">
              {formError && <FormMessage tone="error">{errors.lines ?? formError}</FormMessage>}
              <Button type="submit" variant="sun" size="lg" loading={submitting} className="w-full">
                Place order for {money(q.total)}
              </Button>
            </div>
          </div>
        </aside>
      </form>
    </>
  )
}
