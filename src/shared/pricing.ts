// Pricing shared by the page (what you see) and the Worker (what is charged),
// so the two can never disagree.

import { FLASH_DEALS, SITE, bySlug, findPromo, type Dish, type PromoCode } from '../data'

export interface LineInput {
  slug: string
  size?: string
  extras?: string[]
  quantity: number
}

export type Method = 'delivery' | 'pickup'

const round = (n: number) => Math.round(n * 100) / 100

export const dealFor = (slug: string) => FLASH_DEALS.find((d) => d.slug === slug)

/** Charm pricing: pull a figure down to the nearest rupee ending in 9. */
const charm = (n: number) => Math.max(9, Math.round((n + 1) / 10) * 10 - 1)

/** Base price after any flash deal, before size and extras. */
export function basePrice(dish: Dish): number {
  const deal = dealFor(dish.slug)
  return deal ? charm(dish.price * (1 - deal.off / 100)) : dish.price
}

/** Price before the deal, when there is one, for the struck-through figure. */
export function wasPrice(dish: Dish): number | undefined {
  return dealFor(dish.slug) ? dish.price : dish.compareAt
}

export function unitPrice(dish: Dish, size?: string, extras: string[] = []): number {
  const sizeDelta = dish.sizes?.find((s) => s.id === size)?.price ?? 0
  const extrasTotal = extras.reduce((n, id) => n + (dish.extras?.find((e) => e.id === id)?.price ?? 0), 0)
  return round(basePrice(dish) + sizeDelta + extrasTotal)
}

export interface Quote {
  subtotal: number
  discount: number
  deliveryFee: number
  serviceFee: number
  tax: number
  tip: number
  total: number
  promo?: PromoCode
  promoError?: string
}

export function promoProblem(promo: PromoCode | undefined, subtotal: number, method: Method): string | undefined {
  if (!promo) return 'That code is not valid.'
  if (subtotal < promo.minSubtotal) return `Add ${money(promo.minSubtotal - subtotal)} more to use ${promo.code}.`
  if (promo.kind === 'delivery' && method === 'pickup') return `${promo.code} is for delivery orders.`
  return undefined
}

export function quote(lines: LineInput[], method: Method, promoCode?: string, tip = 0): Quote {
  const subtotal = round(
    lines.reduce((n, l) => {
      const dish = bySlug(l.slug)
      return dish ? n + unitPrice(dish, l.size, l.extras) * l.quantity : n
    }, 0),
  )
  let deliveryFee = method === 'delivery' && subtotal > 0 && subtotal < SITE.freeDeliveryOver ? SITE.deliveryFee : 0
  let discount = 0
  let promo: PromoCode | undefined
  let promoError: string | undefined
  if (promoCode) {
    const found = findPromo(promoCode)
    promoError = promoProblem(found, subtotal, method)
    if (!promoError && found) {
      promo = found
      if (found.kind === 'percent') discount = round((subtotal * found.value) / 100)
      if (found.kind === 'flat') discount = Math.min(found.value, subtotal)
      if (found.kind === 'delivery') deliveryFee = 0
    }
  }
  const serviceFee = subtotal > 0 ? round(subtotal * SITE.serviceFeeRate) : 0
  const tax = round((subtotal - discount) * SITE.taxRate)
  const total = round(subtotal - discount + deliveryFee + serviceFee + tax + tip)
  return { subtotal, discount, deliveryFee, serviceFee, tax, tip: round(tip), total, promo, promoError }
}

// Prices are in Indian rupees. Whole amounts show without paise.
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const inrWhole = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export const money = (n: number) => (Number.isInteger(n) ? inrWhole : inr).format(n)
