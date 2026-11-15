import { ButtonLink } from '../components/Button'
import { Photo } from '../components/Display'
import { useDocumentTitle } from '../lib/hooks'

export function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <section className="on-dark doodles overflow-hidden bg-forest text-white">
      <div className="container-page grid min-h-[70vh] items-center gap-10 py-16 md:grid-cols-2">
        <div>
          <p className="text-[18px] font-medium text-sun">404</p>
          <h1 className="mt-3 text-[clamp(2.6rem,1.6rem+3vw,4.4rem)] leading-[1.02] font-bold">This plate is empty</h1>
          <p className="mt-5 max-w-[440px] text-[17px] leading-relaxed text-on-forest-muted">The page you are after has been eaten, moved or never existed. The menu is still very much here.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/menu" size="lg">
              Browse the menu
            </ButtonLink>
            <ButtonLink to="/" variant="outline-light" size="lg">
              Back home
            </ButtonLink>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[420px]">
          <div className="round absolute inset-0 rounded-full bg-white/95" />
          <div className="round absolute inset-[9%] rounded-full border-2 border-card-2" />
          <Photo name="fries" className="absolute right-[-6%] bottom-[2%] w-[38%] rotate-12" alt="" />
          <span className="absolute inset-0 flex items-center justify-center text-[96px] font-bold text-card-2 select-none" aria-hidden>
            404
          </span>
        </div>
      </div>
    </section>
  )
}
