// Validation shared by the forms (instant feedback) and the Worker (the
// authority). Each validator returns field -> message; empty means valid.

import { ABOUT, bySlug } from '../data'

export type FieldErrors = Record<string, string>

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^[+()\d\s.-]{7,20}$/
const ZIP = /^\d{5}(-\d{4})?$/

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

export const TIPS = [0, 150, 250, 400] as const
export const SLOTS = ['asap', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'] as const
export const PAYMENTS = ['card', 'cash', 'wallet'] as const
export type Payment = (typeof PAYMENTS)[number]

export function validateContactDetails(input: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {}
  const name = str(input.name)
  if (name.length < 2) errors.name = 'Enter your name.'
  else if (name.length > 80) errors.name = 'Keep your name under 80 characters.'
  if (!EMAIL.test(str(input.email))) errors.email = 'Enter a valid email address.'
  if (!PHONE.test(str(input.phone))) errors.phone = 'Enter a phone number so the rider can reach you.'
  return errors
}

export function validateAddress(input: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {}
  if (str(input.street).length < 4) errors.street = 'Enter your street address.'
  if (str(input.city).length < 2) errors.city = 'Enter your city.'
  if (!ZIP.test(str(input.zip))) errors.zip = 'Enter a 5-digit ZIP code.'
  if (str(input.instructions).length > 200) errors.instructions = 'Keep instructions under 200 characters.'
  return errors
}

/** Card fields are checked in the page only. The demo never sends them. */
export function validateCard(input: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {}
  if (!/^\d{16}$/.test(str(input.cardNumber).replace(/\s/g, ''))) errors.cardNumber = 'Enter the 16-digit card number.'
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(str(input.cardExpiry))) errors.cardExpiry = 'Use MM/YY.'
  if (!/^\d{3,4}$/.test(str(input.cardCvc))) errors.cardCvc = '3 or 4 digits.'
  return errors
}

export function validateLines(lines: unknown): string | undefined {
  if (!Array.isArray(lines) || lines.length === 0) return 'Your cart is empty.'
  if (lines.length > 40) return 'That is a lot of food. Call us for orders this large.'
  for (const raw of lines) {
    const l = (raw ?? {}) as Record<string, unknown>
    const dish = bySlug(str(l.slug))
    const qty = Number(l.quantity)
    if (!dish) return 'One of the dishes is no longer on the menu.'
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return 'Quantities must be between 1 and 20.'
    if (l.size !== undefined && !dish.sizes?.some((s) => s.id === l.size)) return `Choose a valid size for ${dish.name}.`
    if (l.extras !== undefined && (!Array.isArray(l.extras) || l.extras.some((e) => !dish.extras?.some((x) => x.id === e))))
      return `One of the extras for ${dish.name} is not available.`
  }
  return undefined
}

export function validateOrder(input: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = { ...validateContactDetails(input) }
  const method = str(input.method)
  if (method !== 'delivery' && method !== 'pickup') errors.method = 'Choose delivery or pickup.'
  if (method === 'delivery') Object.assign(errors, validateAddress(input))
  if (!SLOTS.includes(str(input.slot) as (typeof SLOTS)[number])) errors.slot = 'Choose a time.'
  const tip = Number(input.tip ?? 0)
  if (!TIPS.includes(tip as (typeof TIPS)[number])) errors.tip = 'Choose a tip.'
  if (!PAYMENTS.includes(str(input.payment) as Payment)) errors.payment = 'Choose how you want to pay.'
  const lines = validateLines(input.lines)
  if (lines) errors.lines = lines
  return errors
}

export function validateReview(input: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {}
  const name = str(input.name)
  if (name.length < 2) errors.name = 'Enter your name.'
  else if (name.length > 60) errors.name = 'Keep your name under 60 characters.'
  const rating = Number(input.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = 'Choose a rating from 1 to 5.'
  if (!bySlug(str(input.dish))) errors.dish = 'Choose the dish you ordered.'
  const body = str(input.body)
  if (body.length < 10) errors.body = 'Tell us a little more (at least 10 characters).'
  else if (body.length > 600) errors.body = 'Keep your review under 600 characters.'
  return errors
}

export function validateContact(input: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {}
  if (str(input.name).length < 2) errors.name = 'Enter your name.'
  if (!EMAIL.test(str(input.email))) errors.email = 'Enter a valid email address.'
  if (!ABOUT.contactTopics.includes(str(input.topic))) errors.topic = 'Choose a topic.'
  const message = str(input.message)
  if (message.length < 10) errors.message = 'Tell us a little more (at least 10 characters).'
  else if (message.length > 2000) errors.message = 'Keep your message under 2,000 characters.'
  return errors
}

export function validateSubscribe(input: Record<string, unknown>): FieldErrors {
  return EMAIL.test(str(input.email)) ? {} : { email: 'Enter a valid email address.' }
}
