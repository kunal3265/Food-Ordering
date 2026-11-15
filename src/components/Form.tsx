import { AlertCircle, Check, ChevronDown, CircleCheck } from 'lucide-react'
import { cloneElement, isValidElement, useId, type InputHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

import { cx } from '../lib/hooks'

const control =
  'w-full rounded-[var(--radius-sm)] border-[1.5px] border-line-strong bg-white px-4 text-[15px] text-ink placeholder:text-faint transition-[border-color,box-shadow] duration-[var(--duration-fast)] hov:border-muted focus:border-leaf focus:outline-none focus-visible:outline-none focus:shadow-[0_0_0_4px_rgb(23_96_60/0.15)] data-[force~=focus]:border-leaf data-[force~=focus]:shadow-[0_0_0_4px_rgb(23_96_60/0.15)] disabled:cursor-not-allowed disabled:bg-card disabled:text-muted aria-[invalid=true]:border-tomato-ink aria-[invalid=true]:focus:shadow-[0_0_0_4px_rgb(192_61_23/0.15)]'

type FieldProps = { label: string; error?: string; hint?: string; children: ReactElement<Record<string, unknown>>; className?: string; optional?: boolean }

/** Label + control + hint/error, wired with ids and aria attributes. */
export function Field({ label, error, hint, children, className, optional }: FieldProps) {
  const id = useId()
  const describedBy = [error ? `${id}-err` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
  const child = isValidElement(children)
    ? cloneElement(children, { id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })
    : children
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[14px] font-medium">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {child}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[13px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="flex items-center gap-1.5 text-[13px] text-tomato-ink">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}

export function Input({ className, force, ...rest }: InputHTMLAttributes<HTMLInputElement> & { force?: string }) {
  return <input data-force={force} className={cx(control, 'h-12', className)} {...rest} />
}

export function Textarea({ className, force, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { force?: string }) {
  return <textarea data-force={force} className={cx(control, 'min-h-28 resize-y py-3 leading-relaxed', className)} {...rest} />
}

export function Select({ className, children, force, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { force?: string }) {
  return (
    <div className="relative">
      <select data-force={force} className={cx(control, 'h-12 appearance-none pr-10', className)} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  )
}

/** Form-level message: error (server or network) or success. */
export function FormMessage({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx(
        'flex items-start gap-2.5 rounded-[var(--radius-sm)] px-4 py-3 text-[14px]',
        tone === 'error' ? 'bg-[#fdeee8] text-tomato-ink' : 'bg-lime-soft text-forest',
      )}
    >
      {tone === 'error' ? <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> : <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />}
      <div>{children}</div>
    </div>
  )
}

export interface Choice<T extends string> {
  value: T
  label: ReactNode
  detail?: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

/**
 * Radio cards: a radio group laid out as tappable tiles. Used for delivery
 * method, sizes, payment and tips.
 */
export function ChoiceGroup<T extends string>({
  legend,
  value,
  onChange,
  options,
  columns = 2,
  error,
  hideLegend,
  name,
  size = 'md',
}: {
  legend: string
  value: T | undefined
  onChange: (v: T) => void
  options: Choice<T>[]
  columns?: 2 | 3 | 4
  error?: string
  hideLegend?: boolean
  name?: string
  size?: 'sm' | 'md'
}) {
  const id = useId()
  return (
    <fieldset aria-describedby={error ? `${id}-err` : undefined}>
      <legend className={cx('mb-2 text-[14px] font-medium', hideLegend && 'sr-only')}>{legend}</legend>
      <div className={cx('grid gap-2.5', columns === 2 && 'grid-cols-2', columns === 3 && 'grid-cols-2 sm:grid-cols-3', columns === 4 && 'grid-cols-2 sm:grid-cols-4')}>
        {options.map((o) => {
          const checked = value === o.value
          return (
            <label
              key={o.value}
              className={cx(
                'relative flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border-[1.5px] bg-white transition-colors duration-[var(--duration-fast)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-leaf',
                size === 'sm' ? 'min-h-12 px-3 py-2' : 'min-h-16 px-4 py-3',
                checked ? 'border-leaf bg-lime-soft' : 'border-line-strong hover:border-muted',
                o.disabled && 'pointer-events-none opacity-45',
              )}
            >
              <input
                type="radio"
                name={name ?? id}
                value={o.value}
                checked={checked}
                disabled={o.disabled}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {o.icon && <span className={cx('shrink-0 [&_svg]:size-5', checked ? 'text-leaf' : 'text-muted')}>{o.icon}</span>}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[15px] font-medium">{o.label}</span>
                {o.detail && <span className="text-[13px] text-muted">{o.detail}</span>}
              </span>
              <span
                className={cx(
                  'round flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors',
                  checked ? 'border-leaf bg-leaf text-white' : 'border-line-strong',
                )}
                aria-hidden
              >
                {checked && <Check className="size-3" strokeWidth={3} />}
              </span>
            </label>
          )
        })}
      </div>
      {error && (
        <p id={`${id}-err`} className="mt-1.5 flex items-center gap-1.5 text-[13px] text-tomato-ink">
          <AlertCircle className="size-3.5" aria-hidden />
          {error}
        </p>
      )}
    </fieldset>
  )
}

/** Checkbox row with a label and optional price on the right. */
export function CheckRow({ checked, onChange, label, aside, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; aside?: ReactNode; disabled?: boolean }) {
  return (
    <label
      className={cx(
        'flex min-h-12 cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-3 transition-colors hover:bg-card has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-leaf',
        disabled && 'pointer-events-none opacity-45',
      )}
    >
      <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className={cx('flex size-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] transition-colors', checked ? 'border-leaf bg-leaf text-white' : 'border-line-strong bg-white')}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className="flex-1 text-[15px]">{label}</span>
      {aside && <span className="text-[14px] text-muted tabular-nums">{aside}</span>}
    </label>
  )
}

/** Segmented control (single choice, compact). */
export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="round inline-flex rounded-full bg-card p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
              e.preventDefault()
              const i = options.findIndex((x) => x.value === value)
              const next = options[(i + (e.key === 'ArrowRight' ? 1 : options.length - 1)) % options.length]
              onChange(next.value)
              ;(e.currentTarget.parentElement?.querySelectorAll('button')[options.indexOf(next)] as HTMLButtonElement | undefined)?.focus()
            }}
            tabIndex={active ? 0 : -1}
            className={cx(
              'round h-10 rounded-full px-4 text-[14px] font-medium transition-colors duration-[var(--duration-fast)]',
              active ? 'bg-white text-ink shadow-[0_2px_8px_-2px_rgb(0_0_0/0.15)]' : 'text-muted hover:text-ink',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
