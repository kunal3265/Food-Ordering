import { useEffect, useRef, useState, type RefObject } from 'react'

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | Forkfast` : 'Forkfast: fast food, delivered hot'
  }, [title])
}

/** Re-renders every `ms` milliseconds and returns the current time. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), ms)
    return () => window.clearInterval(t)
  }, [ms])
  return now
}

/** Seconds left in a repeating cycle, so demo deals always have a live timer. */
export function cycleRemaining(cycleHours: number, now: number, offsetSeconds = 0) {
  const cycle = cycleHours * 3600
  const t = Math.floor(now / 1000) + offsetSeconds
  return cycle - (t % cycle)
}

export function splitTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps Tab inside `ref` while `active`, closes on Escape and gives focus back
 * to whatever had it before when it closes.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onClose: () => void) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    if (!active) return
    const previous = document.activeElement as HTMLElement | null
    const node = ref.current
    const first = node?.querySelector<HTMLElement>('[data-autofocus]') ?? node?.querySelector<HTMLElement>(FOCUSABLE)
    window.setTimeout(() => (first ?? node)?.focus(), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === firstEl || !node.contains(document.activeElement))) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      window.setTimeout(() => previous?.focus?.(), 0)
    }
  }, [active, ref])
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

export type ApiResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string> }

/** POST JSON to a Worker route and normalise the response. */
export async function postJson<T = unknown>(url: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok)
      return {
        ok: false,
        error: typeof json.error === 'string' ? json.error : 'Something went wrong. Please try again.',
        fieldErrors: (json.fieldErrors as Record<string, string>) ?? undefined,
      }
    return { ok: true, data: json as T }
  } catch {
    return { ok: false, error: 'We could not reach the kitchen. Check your connection and try again.' }
  }
}
