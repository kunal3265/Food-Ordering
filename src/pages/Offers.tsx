import { Check, Copy, TicketPercent } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../components/Button'
import { DealCard, PromoBurger, PromoFresh, PromoPizza } from '../components/Cards'
import { Reveal, SectionHeading } from '../components/Display'
import { PageHeader } from '../components/Layout'
import { useToast } from '../components/Overlay'
import { FLASH_DEALS, PROMO_CODES, type PromoCode } from '../data'
import { useDocumentTitle } from '../lib/hooks'

export function CouponCard({ promo }: { promo: PromoCode }) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(promo.code)
    } catch {
      // Clipboard can be blocked; the code is on screen either way.
    }
    setCopied(true)
    toast(`Copied ${promo.code}. Paste it at checkout.`)
    window.setTimeout(() => setCopied(false), 2000)
  }
  return (
    <article className="relative flex overflow-hidden rounded-[var(--radius-md)] border-[1.5px] border-dashed border-line-strong bg-white">
      <div className="flex w-24 shrink-0 items-center justify-center bg-sun">
        <TicketPercent className="size-8 text-ink" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-[18px] font-semibold">{promo.title}</h3>
          <p className="text-[14px] text-muted">{promo.detail}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <code className="rounded-[8px] bg-card px-3 py-1.5 text-[15px] font-semibold tracking-wide">{promo.code}</code>
          <Button variant={copied ? 'leaf' : 'outline'} size="sm" onClick={copy} icon={copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}>
            {copied ? 'Copied' : 'Copy code'}
          </Button>
        </div>
      </div>
    </article>
  )
}

export function OffersPage() {
  useDocumentTitle('Offers')
  return (
    <>
      <PageHeader title="Offers and codes" body="This week's deals, flash prices that reset through the day, and codes you can use at checkout." />
      <section className="container-page pt-14" aria-labelledby="codes">
        <SectionHeading title={<span id="codes">Promo codes</span>} body="One code per order. Codes are checked by the kitchen's server at checkout." />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {PROMO_CODES.map((p) => (
            <CouponCard key={p.code} promo={p} />
          ))}
        </div>
      </section>
      <section className="container-page pt-20" aria-label="This week">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-6">
            <PromoFresh />
            <PromoPizza />
          </div>
          <PromoBurger className="h-full" />
        </div>
      </section>
      <section className="container-page pt-20 pb-24" aria-labelledby="flash">
        <SectionHeading title={<span id="flash">Flash deals</span>} body="Prices already include the discount. When a timer runs out, the deal comes straight back." />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FLASH_DEALS.map((d, i) => (
            <Reveal key={d.slug} delay={(i % 3) * 0.05}>
              <DealCard deal={d} index={i} featured />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
