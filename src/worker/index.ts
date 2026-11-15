import { Hono } from 'hono'

import { CATEGORIES, MENU } from '../data'
import { basePrice, promoProblem, quote, type LineInput, type Method } from '../shared/pricing'
import { findPromo } from '../data'
import {
  validateContact,
  validateLines,
  validateOrder,
  validateReview,
  validateSubscribe,
  type FieldErrors,
} from '../shared/validation'

// The Worker in front of the static site. The menu ships with the app; these
// routes check what a browser sends and price orders on the server. Orders are
// a demo: nothing is charged and nothing is stored. To take real orders,
// create a Stripe Checkout session in POST /api/orders (secret key via Sites
// secrets) and persist the order to D1.
type Env = { ASSETS: Fetcher }

const app = new Hono<{ Bindings: Env }>()

const reference = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json()
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}

const invalid = (fieldErrors: FieldErrors) => Response.json({ error: 'Please check the highlighted fields.', fieldErrors }, { status: 422 })
const badJson = () => Response.json({ error: 'Send a JSON object.' }, { status: 400 })

app.get('/api/health', (c) => c.json({ ok: true }))

app.get('/api/menu', (c) =>
  c.json({
    categories: CATEGORIES,
    dishes: MENU.map((d) => ({ slug: d.slug, name: d.name, category: d.category, price: basePrice(d), listPrice: d.price })),
  }),
)

// Check a promo code against a cart. 200 with the discount, 422 when the code
// cannot be used yet (with the reason), 400 for a malformed body.
app.post('/api/promo', async (c) => {
  const body = await readBody(c.req.raw)
  if (!body) return badJson()
  const code = typeof body.code === 'string' ? body.code : ''
  const method: Method = body.method === 'pickup' ? 'pickup' : 'delivery'
  const linesError = validateLines(body.lines)
  if (linesError) return invalid({ lines: linesError })
  const lines = body.lines as LineInput[]
  const promo = findPromo(code)
  const problem = promoProblem(promo, quote(lines, method).subtotal, method)
  if (problem) return invalid({ code: problem })
  const q = quote(lines, method, code)
  return c.json({ ok: true, code: promo!.code, title: promo!.title, discount: q.discount, deliveryFee: q.deliveryFee })
})

// Demo checkout: validates the order, prices it here (never trusting the
// browser's totals) and returns a reference.
app.post('/api/orders', async (c) => {
  const body = await readBody(c.req.raw)
  if (!body) return badJson()
  const errors = validateOrder(body)
  const method = body.method as Method
  const lines = (body.lines ?? []) as LineInput[]
  let promoCode: string | undefined
  if (!errors.lines && typeof body.promo === 'string' && body.promo.trim()) {
    const problem = promoProblem(findPromo(body.promo), quote(lines, method).subtotal, method)
    if (problem) errors.promo = problem
    else promoCode = body.promo
  }
  if (Object.keys(errors).length) return invalid(errors)
  const q = quote(lines, method, promoCode, Number(body.tip ?? 0))
  return c.json({ ok: true, reference: reference('FF'), quote: { ...q, promo: q.promo?.code } }, 201)
})

app.post('/api/reviews', async (c) => {
  const body = await readBody(c.req.raw)
  if (!body) return badJson()
  const errors = validateReview(body)
  if (Object.keys(errors).length) return invalid(errors)
  return c.json({ ok: true, reference: reference('RV') }, 201)
})

app.post('/api/contact', async (c) => {
  const body = await readBody(c.req.raw)
  if (!body) return badJson()
  const errors = validateContact(body)
  if (Object.keys(errors).length) return invalid(errors)
  return c.json({ ok: true, reference: reference('MSG') }, 201)
})

app.post('/api/subscribe', async (c) => {
  const body = await readBody(c.req.raw)
  if (!body) return badJson()
  const errors = validateSubscribe(body)
  if (Object.keys(errors).length) return invalid(errors)
  return c.json({ ok: true }, 201)
})

app.all('/api/*', (c) => c.json({ error: 'Not found' }, 404))

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
