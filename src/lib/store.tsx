import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { bySlug, type Dish } from '../data'
import { unitPrice, type Method, type Quote } from '../shared/pricing'

// Cart, saved dishes and past orders, all kept in this browser's localStorage.

export interface CartLine {
  id: string
  slug: string
  size?: string
  extras: string[]
  notes?: string
  quantity: number
}

export interface CartItem extends CartLine {
  dish: Dish
  unit: number
}

export interface OrderLine {
  slug: string
  name: string
  quantity: number
  unit: number
  options: string
}

export interface Order {
  reference: string
  createdAt: number
  method: Method
  name: string
  phone: string
  address?: string
  slot: string
  payment: string
  lines: OrderLine[]
  quote: Omit<Quote, 'promo' | 'promoError'> & { promo?: string }
  review?: boolean
}

const KEYS = { cart: 'forkfast-cart', saved: 'forkfast-saved', orders: 'forkfast-orders' }

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private mode or full storage: the app still works for this visit.
  }
}

export const lineId = (slug: string, size: string | undefined, extras: string[], notes?: string) =>
  [slug, size ?? '', [...extras].sort().join('+'), (notes ?? '').trim()].join('|')

export function describeOptions(dish: Dish, size?: string, extras: string[] = []): string {
  const parts: string[] = []
  const s = dish.sizes?.find((o) => o.id === size)
  if (s) parts.push(s.label)
  for (const id of extras) {
    const e = dish.extras?.find((o) => o.id === id)
    if (e) parts.push(e.label)
  }
  return parts.join(', ')
}

interface StoreState {
  items: CartItem[]
  count: number
  subtotal: number
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  add: (dish: Dish, opts?: { size?: string; extras?: string[]; notes?: string; quantity?: number; open?: boolean }) => void
  setQuantity: (id: string, quantity: number) => void
  remove: (id: string) => void
  clear: () => void
  saved: string[]
  toggleSaved: (slug: string) => void
  orders: Order[]
  addOrder: (order: Order) => void
  markReviewed: (reference: string) => void
  lastAdded: number
}

const StoreContext = createContext<StoreState | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => load<CartLine[]>(KEYS.cart, []).filter((l) => bySlug(l.slug)))
  const [saved, setSaved] = useState<string[]>(() => load<string[]>(KEYS.saved, []))
  const [orders, setOrders] = useState<Order[]>(() => load<Order[]>(KEYS.orders, []))
  const [cartOpen, setCartOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState(0)

  useEffect(() => save(KEYS.cart, lines), [lines])
  useEffect(() => save(KEYS.saved, saved), [saved])
  useEffect(() => save(KEYS.orders, orders), [orders])

  const add = useCallback<StoreState['add']>((dish, opts = {}) => {
    const size = opts.size ?? dish.sizes?.[0]?.id
    const extras = opts.extras ?? []
    const id = lineId(dish.slug, size, extras, opts.notes)
    const quantity = opts.quantity ?? 1
    setLines((prev) => {
      const hit = prev.find((l) => l.id === id)
      if (hit) return prev.map((l) => (l.id === id ? { ...l, quantity: Math.min(20, l.quantity + quantity) } : l))
      return [...prev, { id, slug: dish.slug, size, extras, notes: opts.notes?.trim() || undefined, quantity }]
    })
    setLastAdded(Date.now())
    if (opts.open) setCartOpen(true)
  }, [])

  const setQuantity = useCallback((id: string, quantity: number) => {
    setLines((prev) => (quantity <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, quantity: Math.min(20, quantity) } : l))))
  }, [])
  const remove = useCallback((id: string) => setLines((prev) => prev.filter((l) => l.id !== id)), [])
  const clear = useCallback(() => setLines([]), [])
  const toggleSaved = useCallback((slug: string) => setSaved((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug])), [])
  const addOrder = useCallback((order: Order) => setOrders((prev) => [order, ...prev].slice(0, 30)), [])
  const markReviewed = useCallback((reference: string) => setOrders((prev) => prev.map((o) => (o.reference === reference ? { ...o, review: true } : o))), [])

  const value = useMemo<StoreState>(() => {
    const items = lines.map((l) => {
      const dish = bySlug(l.slug)!
      return { ...l, dish, unit: unitPrice(dish, l.size, l.extras) }
    })
    return {
      items,
      count: items.reduce((n, l) => n + l.quantity, 0),
      subtotal: Math.round(items.reduce((n, l) => n + l.unit * l.quantity, 0) * 100) / 100,
      cartOpen,
      setCartOpen,
      add,
      setQuantity,
      remove,
      clear,
      saved,
      toggleSaved,
      orders,
      addOrder,
      markReviewed,
      lastAdded,
    }
  }, [lines, cartOpen, add, setQuantity, remove, clear, saved, toggleSaved, orders, addOrder, markReviewed, lastAdded])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore outside StoreProvider')
  return ctx
}

// ---------------------------------------------------------------------------
// Order progress. The demo moves an order through its stages over a few
// minutes so tracking can be tried end to end.

export const STAGES = [
  { id: 'placed', label: 'Order placed', detail: 'We have your order.' },
  { id: 'preparing', label: 'Preparing', detail: 'The kitchen is cooking it now.' },
  { id: 'ready', label: 'Packed', detail: 'Sealed at the pass and on the shelf.' },
  { id: 'onTheWay', label: 'On the way', detail: 'Your rider is heading to you.' },
  { id: 'delivered', label: 'Delivered', detail: 'Enjoy your meal.' },
] as const

const DEMO_SECONDS = [0, 20, 70, 110, 200] // when each stage starts

export function orderStage(order: Order, now = Date.now()): number {
  const elapsed = (now - order.createdAt) / 1000
  let stage = 0
  DEMO_SECONDS.forEach((s, i) => {
    if (elapsed >= s) stage = i
  })
  if (order.method === 'pickup' && stage === 3) stage = 2 // pickup skips the ride
  if (order.method === 'pickup' && elapsed >= DEMO_SECONDS[4]) stage = 4
  return stage
}

export function stageLabel(order: Order, stage: number): string {
  if (order.method === 'pickup' && stage === 2) return 'Ready to collect'
  if (order.method === 'pickup' && stage === 4) return 'Collected'
  return STAGES[stage].label
}

export const secondsLeft = (order: Order, now = Date.now()) => Math.max(0, DEMO_SECONDS[4] - (now - order.createdAt) / 1000)
