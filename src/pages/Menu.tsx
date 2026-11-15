import { Heart, RotateCcw, Search, SearchX, WifiOff } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import { Button } from '../components/Button'
import { DishCard } from '../components/Cards'
import { Chip, DishCardSkeleton, EmptyState, Photo } from '../components/Display'
import { Select } from '../components/Form'
import { PageHeader } from '../components/Layout'
import { CATEGORIES, DIET_LABELS, MENU, type DietTag } from '../data'
import { useDocumentTitle } from '../lib/hooks'
import { useStore } from '../lib/store'
import { basePrice } from '../shared/pricing'

const SORTS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'fastest', label: 'Fastest' },
]

/** Checks the menu is being served; the dishes themselves ship with the page. */
function useMenuStatus() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'offline'>('loading')
  useEffect(() => {
    // Opened straight from disk there is no Worker to ask, and the dishes already ship with the page.
    if (window.location.protocol === 'file:') {
      setStatus('ready')
      return
    }
    let live = true
    fetch('/api/menu')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => live && setStatus('ready'))
      .catch(() => live && setStatus('offline'))
    return () => {
      live = false
    }
  }, [])
  return status
}

export function MenuPage() {
  useDocumentTitle('Menu')
  const [params, setParams] = useSearchParams()
  const { saved } = useStore()
  const status = useMenuStatus()
  const category = params.get('category') ?? 'all'
  const q = params.get('q') ?? ''
  const sort = params.get('sort') ?? 'popular'
  const diet = (params.get('diet')?.split(',').filter(Boolean) ?? []) as DietTag[]
  const onlySaved = params.get('saved') === '1'
  const [query, setQuery] = useState(q)

  useEffect(() => setQuery(q), [q])

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '' || (k === 'category' && v === 'all') || (k === 'sort' && v === 'popular')) next.delete(k)
      else next.set(k, v)
    }
    setParams(next, { replace: true })
  }

  // Search as you type, debounced into the URL.
  useEffect(() => {
    if (query === q) return
    const t = window.setTimeout(() => update({ q: query.trim() || null }), 220)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = MENU.filter(
      (d) =>
        (category === 'all' || d.category === category) &&
        diet.every((t) => d.diet.includes(t)) &&
        (!onlySaved || saved.includes(d.slug)) &&
        (!needle || `${d.name} ${d.description}`.toLowerCase().includes(needle)),
    )
    const by: Record<string, (a: (typeof MENU)[number], b: (typeof MENU)[number]) => number> = {
      popular: (a, b) => b.reviews - a.reviews,
      rating: (a, b) => b.rating - a.rating,
      'price-asc': (a, b) => basePrice(a) - basePrice(b),
      'price-desc': (a, b) => basePrice(b) - basePrice(a),
      fastest: (a, b) => a.minutes - b.minutes,
    }
    return [...list].sort(by[sort] ?? by.popular)
  }, [category, diet, onlySaved, q, saved, sort])

  const toggleDiet = (t: DietTag) => update({ diet: (diet.includes(t) ? diet.filter((x) => x !== t) : [...diet, t]).join(',') || null })
  const filtered = category !== 'all' || diet.length > 0 || onlySaved || q
  const reset = () => {
    setQuery('')
    setParams(new URLSearchParams(), { replace: true })
  }

  return (
    <>
      <PageHeader title="Menu & flavors" body="Seven kitchens, one order. Everything is made in house today and priced with any live deals already applied.">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-8 max-w-[560px]">
          <label htmlFor="menu-search" className="sr-only">
            Search the menu
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search burgers, pizza, salad..."
              className="round h-14 w-full rounded-full bg-white pr-5 pl-13 text-[16px] text-ink placeholder:text-muted focus:outline-3 focus:outline-sun"
            />
          </div>
        </form>
      </PageHeader>

      <div className="sticky top-[84px] z-30 border-b bg-white/95 backdrop-blur">
        <div className="container-page no-scrollbar flex gap-2 overflow-x-auto py-3" role="group" aria-label="Categories">
          <Chip selected={category === 'all'} onClick={() => update({ category: 'all' })}>
            All dishes
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} selected={category === c.id} onClick={() => update({ category: c.id })} icon={<Photo name={c.photo} alt="" className="size-6" />}>
              {c.name}
            </Chip>
          ))}
        </div>
      </div>

      <section className="container-page pt-8 pb-24" aria-label="Dishes">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="group" aria-label="Dietary filters">
            {(Object.keys(DIET_LABELS) as DietTag[]).map((t) => (
              <Chip key={t} selected={diet.includes(t)} onClick={() => toggleDiet(t)}>
                {DIET_LABELS[t]}
              </Chip>
            ))}
            <Chip selected={onlySaved} onClick={() => update({ saved: onlySaved ? null : '1' })} icon={<Heart className="size-4" fill={onlySaved ? 'currentColor' : 'none'} aria-hidden />}>
              Saved ({saved.length})
            </Chip>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[14px] whitespace-nowrap text-muted" aria-live="polite">
              {results.length} dish{results.length === 1 ? '' : 'es'}
            </p>
            <label htmlFor="menu-sort" className="sr-only">
              Sort by
            </label>
            <div className="w-[210px]">
              <Select id="menu-sort" value={sort} onChange={(e) => update({ sort: e.target.value })}>
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {status === 'offline' && (
          <p role="status" className="mt-6 flex items-center gap-2 rounded-[var(--radius-sm)] bg-sun-soft px-4 py-3 text-[14px]">
            <WifiOff className="size-4" aria-hidden />
            We could not reach the kitchen just now. You can still browse; checkout will retry when you are back online.
          </p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {status === 'loading'
            ? Array.from({ length: 6 }, (_, i) => <DishCardSkeleton key={i} />)
            : results.map((d) => <DishCard key={d.slug} dish={d} saveable />)}
        </div>

        {status !== 'loading' && results.length === 0 && (
          <EmptyState
            icon={onlySaved && !saved.length ? <Heart aria-hidden /> : <SearchX aria-hidden />}
            title={onlySaved && !saved.length ? 'No saved dishes yet' : 'Nothing matches that'}
            body={onlySaved && !saved.length ? 'Tap the heart on any dish to keep it here for next time.' : 'Try a different search or clear the filters to see the whole menu.'}
            action={
              filtered ? (
                <Button variant="leaf" icon={<RotateCcw className="size-4" aria-hidden />} onClick={reset}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
      </section>
    </>
  )
}
