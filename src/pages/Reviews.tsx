import { MessageSquareText, Star } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'

import { Button } from '../components/Button'
import { ReviewCard } from '../components/Cards'
import { Chip, EmptyState, StarInput, Stars } from '../components/Display'
import { Field, FormMessage, Input, Select, Textarea } from '../components/Form'
import { PageHeader } from '../components/Layout'
import { MENU, REVIEWS, type Review } from '../data'
import { postJson, useDocumentTitle } from '../lib/hooks'
import { useStore } from '../lib/store'
import { validateReview, type FieldErrors } from '../shared/validation'

const KEY = 'forkfast-reviews'

function loadMine(): Review[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Review[]
  } catch {
    return []
  }
}

export function ReviewsPage() {
  useDocumentTitle('Reviews')
  const [params] = useSearchParams()
  const { markReviewed } = useStore()
  const [mine, setMine] = useState<Review[]>(loadMine)
  const [filter, setFilter] = useState<number | 0>(0)
  const [form, setForm] = useState({ name: '', dish: params.get('dish') ?? '', rating: 0, body: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [state, setState] = useState<{ loading?: boolean; error?: string; done?: boolean }>({})

  const all = useMemo(() => [...mine, ...REVIEWS], [mine])
  const average = all.reduce((n, r) => n + r.rating, 0) / all.length
  const counts = [5, 4, 3, 2, 1].map((s) => ({ s, n: all.filter((r) => r.rating === s).length }))
  const shown = filter ? all.filter((r) => r.rating === filter) : all

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const local = validateReview(form)
    setErrors(local)
    if (Object.keys(local).length) return setState({ error: 'Please check the highlighted fields.' })
    setState({ loading: true })
    const res = await postJson('/api/reviews', form)
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {})
      return setState({ error: res.error })
    }
    const review: Review = { name: form.name.trim(), avatar: Math.floor(Math.random() * 6), rating: form.rating, date: new Date().toISOString().slice(0, 10), dish: form.dish, body: form.body.trim() }
    const next = [review, ...mine]
    setMine(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable */
    }
    const order = params.get('order')
    if (order) markReviewed(order)
    setForm({ name: '', dish: '', rating: 0, body: '' })
    setFilter(0)
    setState({ done: true })
  }

  return (
    <>
      <PageHeader title="Reviews" body="Every review here comes from an order. Here is what people think of the food, the riders and the wait.">
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="text-[56px] leading-none font-bold">{average.toFixed(1)}</span>
          <span className="flex flex-col gap-1">
            <Stars value={Math.round(average * 10) / 10} showValue={false} size={20} />
            <span className="text-[14px] text-on-forest-muted">from {all.length} reviews on this page</span>
          </span>
        </div>
      </PageHeader>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1fr_1.7fr] lg:py-16">
        <aside className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-[108px] lg:self-start">
          <section aria-labelledby="breakdown" className="rounded-[var(--radius-lg)] bg-card p-6">
            <h2 id="breakdown" className="mb-4 text-[18px] font-semibold">
              Rating breakdown
            </h2>
            <ul className="flex flex-col gap-2.5">
              {counts.map(({ s, n }) => (
                <li key={s} className="flex items-center gap-3 text-[14px]">
                  <span className="flex w-8 items-center gap-1 tabular-nums">
                    {s} <Star className="size-3.5 text-sun" fill="currentColor" strokeWidth={0} aria-hidden />
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-white" aria-hidden>
                    <span className="block h-full rounded-full bg-sun" style={{ width: `${(n / all.length) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right text-muted tabular-nums">{n}</span>
                  <span className="sr-only">
                    {n} reviews with {s} stars
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section id="write" aria-labelledby="write-h" className="scroll-mt-28 rounded-[var(--radius-lg)] border p-6">
            <h2 id="write-h" className="mb-5 text-[18px] font-semibold">
              Write a review
            </h2>
            {state.done && (
              <div className="mb-5">
                <FormMessage tone="success">Thanks! Your review is live below.</FormMessage>
              </div>
            )}
            <form onSubmit={submit} noValidate className="flex flex-col gap-4">
              <StarInput value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} error={errors.rating} />
              <Field label="Your name" error={errors.name}>
                <Input autoComplete="given-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </Field>
              <Field label="What did you order?" error={errors.dish}>
                <Select value={form.dish} onChange={(e) => setForm((f) => ({ ...f, dish: e.target.value }))}>
                  <option value="">Choose a dish</option>
                  {MENU.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Your review" error={errors.body} hint={`${form.body.trim().length} / 600`}>
                <Textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
              </Field>
              {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
              <Button type="submit" variant="leaf" loading={state.loading}>
                Post review
              </Button>
            </form>
          </section>
        </aside>

        <section aria-labelledby="all-reviews" className="min-w-0">
          <h2 id="all-reviews" className="sr-only">
            All reviews
          </h2>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0" role="group" aria-label="Filter by rating">
            <Chip selected={filter === 0} onClick={() => setFilter(0)}>
              All
            </Chip>
            {[5, 4, 3, 2, 1].map((s) => (
              <Chip key={s} selected={filter === s} onClick={() => setFilter(s)} icon={<Star className="size-3.5" fill="currentColor" strokeWidth={0} aria-hidden />}>
                {s}
              </Chip>
            ))}
          </div>
          {shown.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {shown.map((r, i) => (
                <ReviewCard key={`${r.name}-${r.date}-${i}`} review={r} />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState icon={<MessageSquareText aria-hidden />} title={`No ${filter}-star reviews yet`} body="Try another rating, or be the first to write one." action={<Button variant="leaf" onClick={() => setFilter(0)}>Show all reviews</Button>} />
            </div>
          )}
        </section>
      </div>
    </>
  )
}
