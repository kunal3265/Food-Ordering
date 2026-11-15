import { CircleCheck, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { cx, useFocusTrap } from '../lib/hooks'
import { IconButton } from './Button'

export function Modal({ open, onClose, title, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: 'md' | 'lg' }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, onClose)
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div className="absolute inset-0 bg-scrim/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cx(
              'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[var(--radius-lg)] bg-white shadow-[var(--shadow-float)] outline-none sm:rounded-[var(--radius-lg)]',
              size === 'md' ? 'sm:max-w-[520px]' : 'sm:max-w-[760px]',
            )}
          >
            <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
              <h2 className="text-[20px] font-semibold">{title}</h2>
              <IconButton tone="card" size="sm" aria-label="Close" onClick={onClose}>
                <X aria-hidden />
              </IconButton>
            </div>
            <div className="overflow-y-auto px-6 pb-6">{children}</div>
            {footer && <div className="border-t px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function Drawer({ open, onClose, title, children, footer, side = 'right' }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; side?: 'right' | 'left' }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, onClose)
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div className="absolute inset-0 bg-scrim/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : 'Panel'}
            tabIndex={-1}
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className={cx(
              'absolute top-0 bottom-0 flex w-full max-w-[440px] flex-col bg-white shadow-[var(--shadow-drawer)] outline-none',
              side === 'right' ? 'right-0 rounded-l-[var(--radius-lg)]' : 'left-0 rounded-r-[var(--radius-lg)]',
            )}
          >
            <div className="flex items-center justify-between gap-4 border-b px-6 py-4">
              <h2 className="text-[20px] font-semibold">{title}</h2>
              <IconButton tone="card" size="sm" aria-label="Close" onClick={onClose}>
                <X aria-hidden />
              </IconButton>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t px-6 py-5">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

// ---------------------------------------------------------------------------
// Toasts

interface ToastItem {
  id: number
  message: ReactNode
  action?: ReactNode
}
const ToastContext = createContext<(message: ReactNode, action?: ReactNode) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const push = useCallback((message: ReactNode, action?: ReactNode) => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev.slice(-2), { id, message, action }])
    window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3800)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="on-dark pointer-events-auto flex min-h-12 items-center gap-3 rounded-full bg-forest py-2 pr-2 pl-4 text-[14px] text-white shadow-[var(--shadow-float)]"
            >
              <CircleCheck className="size-4 shrink-0 text-sun" aria-hidden />
              <span>{t.message}</span>
              {t.action}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

/** A static toast for the style guide. */
export function ToastPreview({ children }: { children: ReactNode }) {
  return (
    <div className="on-dark flex min-h-12 w-fit items-center gap-3 rounded-full bg-forest py-2 pr-4 pl-4 text-[14px] text-white shadow-[var(--shadow-float)]">
      <CircleCheck className="size-4 text-sun" aria-hidden />
      {children}
    </div>
  )
}
