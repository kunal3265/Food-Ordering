import { ArrowDown, ArrowRight, ChefHat, MapPin, ShoppingBag, Star } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'

import { ButtonLink } from '../components/Button'
import { CategoryTile, DealCard, DishCard, PromoBurger, PromoFresh, PromoPizza, ReviewCard } from '../components/Cards'
import { AvatarStack, Photo, Reveal, SectionHeading, Stars } from '../components/Display'
import { CATEGORIES, CATEGORY_BAND, FLASH_DEALS, HERO, MENU, REVIEWS, STATS, STEPS, TOP_PICKS } from '../data'
import { cx, useDocumentTitle } from '../lib/hooks'

const ease = [0.22, 1, 0.36, 1] as const

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M20 2c2 9 6 13 16 15-10 2-14 6-16 16-2-10-6-14-16-16C14 15 18 11 20 2z" fill="var(--color-sun)" transform="rotate(12 20 20)" />
    </svg>
  )
}

/** Scalloped frame (two columns of three lobes) for the hero picture. */
export function BlobFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx('relative', className)} style={{ clipPath: 'url(#ff-blob)' }}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <clipPath id="ff-blob" clipPathUnits="objectBoundingBox">
          <circle cx=".27" cy=".19" r=".19" />
          <circle cx=".73" cy=".19" r=".19" />
          <circle cx=".25" cy=".5" r=".2" />
          <circle cx=".75" cy=".5" r=".2" />
          <circle cx=".27" cy=".81" r=".19" />
          <circle cx=".73" cy=".81" r=".19" />
          <rect x=".2" y=".08" width=".6" height=".84" rx=".12" />
        </clipPath>
      </svg>
      {children}
    </div>
  )
}

function Hero() {
  return (
    <section className="on-dark doodles relative overflow-hidden bg-forest text-white">
      <div className="container-page relative grid items-center gap-y-10 pt-8 pb-20 md:pt-14 lg:min-h-[760px] lg:grid-cols-[1.12fr_1fr_0.62fr] lg:gap-x-6 lg:pt-6 lg:pb-24">
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="text-[clamp(3.2rem,1.6rem+5.4vw,6rem)] leading-[1.02] font-bold tracking-[-0.03em]"
          >
            <span className="text-sun">{HERO.titleAccent}</span>
            <br />
            {HERO.title.split(' ').slice(0, 2).join(' ')}
            <br />
            {HERO.title.split(' ').slice(2).join(' ')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease }}
            className="mt-8 max-w-[470px] text-[16px] leading-[1.75] text-on-forest-muted"
          >
            {HERO.body}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22, ease }} className="mt-10">
            <ButtonLink to="/menu" size="lg" iconRight={<ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden />} className="group">
              {HERO.cta}
            </ButtonLink>
          </motion.div>
        </div>

        <div className="relative flex flex-col items-center">
          <motion.figure initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="mb-4 flex flex-col items-center text-center">
            <Stars value={5} showValue={false} size={15} />
            <blockquote className="mt-2 max-w-[300px] text-[15px] leading-snug">“{HERO.quote}”</blockquote>
          </motion.figure>
          <motion.div initial={{ opacity: 0, scale: 0.9, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.9, delay: 0.1, ease }} className="relative w-full max-w-[380px]">
            <div className="absolute inset-x-[8%] top-[12%] bottom-[2%] rounded-[44%] bg-[radial-gradient(closest-side,rgb(247_195_46/0.28),transparent)]" aria-hidden />
            <Photo name="burgerStack" eager className="relative w-full drop-shadow-[0_40px_40px_rgb(0_0_0/0.45)] motion-safe:animate-float" />
          </motion.div>
          <Sparkle className="absolute bottom-[-6%] left-[-4%] size-10 motion-safe:animate-spin-slow lg:left-[-14%]" />
        </div>

        <div className="relative hidden flex-col items-start gap-6 lg:flex">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease }} className="w-full max-w-[240px]">
            <BlobFrame className="aspect-[0.92]">
              <div className="relative size-full bg-[linear-gradient(160deg,#ffd659,#f7a72e)]">
                <Photo name="hotdog" eager className="absolute top-[18%] left-[-14%] w-[128%] -rotate-[22deg]" alt="Hot dog with mustard" />
                <Photo name="fries" eager className="absolute bottom-[2%] left-[34%] w-[48%] rotate-[8deg]" alt="" />
              </div>
            </BlobFrame>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col gap-2">
            <AvatarStack count={4} />
            <p className="mt-1 text-[15px]">{HERO.customers}</p>
            <span className="flex items-center gap-2">
              <Stars value={5} showValue={false} size={16} />
              <span className="text-[15px] font-medium">{HERO.rating}</span>
            </span>
          </motion.div>
        </div>

        <a
          href="#offers"
          aria-label="Scroll to offers"
          className="round absolute right-[clamp(16px,5vw,100px)] bottom-8 hidden size-12 items-center justify-center rounded-full border-[1.5px] border-white/70 text-white transition-colors hover:bg-white hover:text-forest md:flex"
        >
          <ArrowDown className="size-5 motion-safe:animate-bounce" aria-hidden />
        </a>
      </div>
    </section>
  )
}

function Offers() {
  return (
    <section id="offers" className="container-page scroll-mt-24 pt-20 md:pt-28" aria-label="Offers">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-6">
          <Reveal>
            <PromoFresh />
          </Reveal>
          <Reveal delay={0.08}>
            <PromoPizza />
          </Reveal>
        </div>
        <Reveal delay={0.14} className="h-full">
          <PromoBurger className="h-full" />
        </Reveal>
      </div>
    </section>
  )
}

function TopPicks() {
  const picks = TOP_PICKS.map((slug) => MENU.find((d) => d.slug === slug)!)
  return (
    <section className="container-page pt-24 md:pt-28" aria-labelledby="picks">
      <SectionHeading
        align="center"
        title={<span id="picks">Our top picks</span>}
        action={
          <Link to="/menu" className="inline-flex min-h-10 items-center gap-1.5 text-[15px] font-medium text-leaf hover:underline">
            See the full menu <ArrowRight className="size-4" aria-hidden />
          </Link>
        }
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {picks.map((d, i) => (
          <Reveal key={d.slug} delay={(i % 3) * 0.06}>
            <DishCard dish={d} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

// Desktop positions for the floating category tiles around the pizza board.
const TILE_SPOTS = [
  'lg:left-[8%] lg:top-[30%]',
  'lg:left-[27%] lg:top-[4%]',
  'lg:right-[3%] lg:top-[24%]',
  'lg:left-[50%] lg:top-[56%]',
  'lg:left-[25%] lg:top-[66%]',
  'lg:right-[16%] lg:top-[-2%]',
]

function Categories() {
  return (
    <section className="mt-24 bg-lime md:mt-28" aria-labelledby="cats">
      <div className="container-page py-16 md:py-20">
        <SectionHeading align="split" title={<span id="cats">{CATEGORY_BAND.title}</span>} body={CATEGORY_BAND.body} />
        <div className="relative mt-10 lg:mt-6 lg:h-[560px]">
          <div className="pointer-events-none relative mx-auto hidden aspect-[6/5] w-[min(100%,620px)] lg:absolute lg:top-[2%] lg:right-[4%] lg:block" aria-hidden>
            <Photo name="pizzaBoard" className="absolute inset-0 size-full drop-shadow-[0_30px_40px_rgb(0_0_0/0.3)]" alt="" />
          </div>
          <ul className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 lg:static lg:mx-0 lg:block lg:overflow-visible lg:p-0">
            {CATEGORIES.slice(0, 6).map((c, i) => (
              <li key={c.id} className={cx('shrink-0 lg:absolute', TILE_SPOTS[i])}>
                <Reveal delay={i * 0.06}>
                  <CategoryTile category={c} to={`/menu?category=${c.id}`} />
                </Reveal>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-end lg:absolute lg:right-0 lg:bottom-0 lg:mt-0">
            <ButtonLink to="/menu" variant="leaf" size="sm">
              {CATEGORY_BAND.cta}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}

function FlashDeals() {
  const [a, b, featured, c, d] = FLASH_DEALS
  return (
    <section className="container-page pt-20 md:pt-24" aria-labelledby="deals">
      <SectionHeading align="center" title={<span id="deals">Flash deals: ending soon!</span>} />
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-[1fr_1.05fr_1fr]">
        <div className="flex flex-col">
          <DealCard deal={a} index={0} />
          <DealCard deal={b} index={1} />
        </div>
        <div className="md:order-first md:col-span-2 lg:order-none lg:col-span-1">
          <DealCard deal={featured} index={2} featured />
        </div>
        <div className="flex flex-col">
          <DealCard deal={c} index={3} />
          <DealCard deal={d} index={4} />
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const icons = [ChefHat, ShoppingBag, MapPin]
  return (
    <section className="container-page pt-24 md:pt-28" aria-labelledby="how">
      <div className="grid gap-10 rounded-[var(--radius-xl)] bg-card p-8 md:p-12 lg:grid-cols-[0.9fr_2fr] lg:items-center">
        <div>
          <SectionHeading title={<span id="how">Hot food in three steps</span>} body="No account needed. Your cart and orders stay on this device." />
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="text-[13px] text-muted">{s.label}</dt>
                <dd className="text-[26px] font-semibold tracking-[-0.02em]">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = icons[i]
            return (
              <li key={s.title}>
                <Reveal delay={i * 0.08} className="flex h-full flex-col gap-3 rounded-[var(--radius-md)] bg-white p-6 shadow-[var(--shadow-card)]">
                  <span className="round flex size-12 items-center justify-center rounded-full bg-sun text-ink">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-[13px] font-medium text-muted">Step {i + 1}</span>
                  <h3 className="text-[19px] font-semibold">{s.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted">{s.body}</p>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

function ReviewsStrip() {
  return (
    <section className="container-page pt-24 pb-24 md:pt-28 md:pb-28" aria-labelledby="loved">
      <SectionHeading
        align="split"
        title={<span id="loved">Loved by 1,500+ people a week</span>}
        body={
          <span className="inline-flex items-center gap-2 text-ink">
            <Star className="size-4 text-sun" fill="currentColor" strokeWidth={0} aria-hidden />
            4.8 average from verified orders
          </span>
        }
        action={
          <ButtonLink to="/reviews" variant="outline" size="sm" className="self-start">
            Read all reviews
          </ButtonLink>
        }
      />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {REVIEWS.slice(0, 3).map((r, i) => (
          <Reveal key={r.name} delay={i * 0.06}>
            <ReviewCard review={r} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function Home() {
  useDocumentTitle('')
  return (
    <>
      <Hero />
      <Offers />
      <TopPicks />
      <Categories />
      <FlashDeals />
      <HowItWorks />
      <ReviewsStrip />
    </>
  )
}
