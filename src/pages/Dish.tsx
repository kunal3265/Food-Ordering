import { ChevronRight, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import { Button } from '../components/Button'
import { DishCard, Price, ReviewCard, SaveButton } from '../components/Cards'
import { Badge, DishMeta, Photo, QtyStepper, SectionHeading, Stars } from '../components/Display'
import { CheckRow, ChoiceGroup, Field, Textarea } from '../components/Form'
import { useToast } from '../components/Overlay'
import { DIET_LABELS, MENU, REVIEWS, bySlug, categoryById } from '../data'
import { useDocumentTitle } from '../lib/hooks'
import { useStore } from '../lib/store'
import { dealFor, money, unitPrice } from '../shared/pricing'
import { NotFound } from './NotFound'

export function DishPage() {
  const { slug = '' } = useParams()
  const dish = bySlug(slug)
  useDocumentTitle(dish?.name ?? 'Dish not found')
  const { add, setCartOpen } = useStore()
  const toast = useToast()
  const [size, setSize] = useState(dish?.sizes?.[0]?.id)
  const [extras, setExtras] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setSize(dish?.sizes?.[0]?.id)
    setExtras([])
    setNotes('')
    setQty(1)
  }, [dish])

  if (!dish) return <NotFound />

  const category = categoryById(dish.category)
  const deal = dealFor(dish.slug)
  const unit = unitPrice(dish, size, extras)
  const reviews = REVIEWS.filter((r) => r.dish === dish.slug)
  const related = MENU.filter((d) => d.slug !== dish.slug && (d.category === dish.category || d.popular)).slice(0, 3)
  const notesError = notes.length > 140 ? 'Keep notes under 140 characters.' : undefined

  const submit = () => {
    if (notesError) return
    add(dish, { size, extras, notes, quantity: qty })
    toast(
      <>
        Added {qty > 1 ? `${qty} × ` : ''}
        {dish.name}
      </>,
      <button type="button" onClick={() => setCartOpen(true)} className="round h-9 rounded-full bg-sun px-4 text-[13px] font-medium text-ink hover:bg-sun-2">
        View cart
      </button>,
    )
    setQty(1)
  }

  return (
    <>
      <div className="bg-forest">
        <nav aria-label="Breadcrumb" className="container-page on-dark flex h-12 items-center gap-1.5 text-[14px] text-on-forest-muted">
          <Link to="/menu" className="inline-flex min-h-10 min-w-10 items-center hover:text-white">
            Menu
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link to={`/menu?category=${dish.category}`} className="inline-flex min-h-10 items-center hover:text-white">
            {category?.name}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="truncate text-white" aria-current="page">
            {dish.name}
          </span>
        </nav>
      </div>

      <section className="container-page grid gap-10 pt-10 pb-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-14">
        <div className="relative flex aspect-square items-center justify-center self-start overflow-hidden rounded-[var(--radius-xl)] bg-card lg:sticky lg:top-[110px]">
          <div className="absolute inset-[14%] rounded-full bg-lime/60 blur-2xl" aria-hidden />
          <Photo name={dish.photo} eager className="relative w-[72%] drop-shadow-[0_30px_30px_rgb(0_0_0/0.22)] motion-safe:animate-float" />
          {deal && (
            <span className="round absolute top-6 left-6 flex size-24 flex-col items-center justify-center rounded-full bg-sun text-ink">
              <span className="text-[13px]">Save</span>
              <span className="text-[28px] leading-none font-bold">{deal.off}%</span>
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone="lime">{category?.name}</Badge>
              {dish.diet.map((t) => (
                <Badge key={t} tone="neutral">
                  {DIET_LABELS[t]}
                </Badge>
              ))}
            </div>
            <SaveButton slug={dish.slug} name={dish.name} className="bg-card" />
          </div>
          <h1 className="mt-4 text-[clamp(2.2rem,1.6rem+2vw,3.2rem)] leading-[1.05] font-bold">{dish.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-2">
              <Stars value={dish.rating} size={16} />
              <span className="text-[14px] text-muted">({dish.reviews.toLocaleString()} ratings)</span>
            </span>
            <DishMeta minutes={dish.minutes} calories={dish.calories} />
          </div>
          <div className="mt-5">
            <Price dish={dish} size="lg" />
          </div>
          <p className="mt-5 text-[17px] leading-relaxed text-muted">{dish.description}</p>

          <div className="mt-8 flex flex-col gap-7 border-t pt-7">
            {dish.sizes && (
              <ChoiceGroup
                legend="Choose a size"
                value={size}
                onChange={setSize}
                columns={dish.sizes.length === 3 ? 3 : 2}
                options={dish.sizes.map((s) => ({ value: s.id, label: s.label, detail: s.price ? `+${money(s.price)}` : 'Included' }))}
              />
            )}
            {dish.extras && (
              <fieldset>
                <legend className="mb-1 text-[14px] font-medium">Add extras</legend>
                <div className="-mx-3 flex flex-col">
                  {dish.extras.map((e) => (
                    <CheckRow
                      key={e.id}
                      checked={extras.includes(e.id)}
                      onChange={(on) => setExtras((prev) => (on ? [...prev, e.id] : prev.filter((x) => x !== e.id)))}
                      label={e.label}
                      aside={`+${money(e.price)}`}
                    />
                  ))}
                </div>
              </fieldset>
            )}
            <Field label="Notes for the kitchen" optional error={notesError} hint="Allergies, no onions, extra crispy...">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="min-h-20" />
            </Field>
          </div>

          <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center gap-3 border-t bg-white px-4 py-4 sm:static sm:mx-0 sm:border-0 sm:p-0">
            <QtyStepper value={qty} onChange={setQty} label="Quantity" />
            <Button variant="sun" size="lg" className="min-w-0 flex-1 justify-between px-5 sm:px-8" onClick={submit} icon={<ShoppingBag className="size-5 max-sm:hidden" aria-hidden />} iconRight={<span className="tabular-nums">{money(unit * qty)}</span>}>
              Add to cart
            </Button>
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="container-page pb-16" aria-labelledby="dish-reviews">
          <SectionHeading title={<span id="dish-reviews">What people say</span>} />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <ReviewCard key={r.name} review={r} />
            ))}
          </div>
        </section>
      )}

      <section className="container-page pb-24" aria-labelledby="related">
        <SectionHeading title={<span id="related">You might also like</span>} />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((d) => (
            <DishCard key={d.slug} dish={d} saveable />
          ))}
        </div>
      </section>
    </>
  )
}
