import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { CircleAlert, CircleCheck } from "lucide-react"

interface Toast {
  id: number
  message: string
  tone: "success" | "error"
  action?: { label: string; onClick: () => void }
}

type ShowToast = (message: string, options?: { tone?: Toast["tone"]; action?: Toast["action"] }) => void

const ToastContext = createContext<ShowToast>(() => {})

/** Quiet confirmation messages ("Loan LN-2026-0004 saved") with an optional Undo. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback<ShowToast>((message, options = {}) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current.slice(-2), { id, message, tone: options.tone ?? "success", action: options.action }])
    // Errors stay longer so there's time to read them.
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), options.tone === "error" ? 8000 : 4500)
  }, [])

  const dismiss = (id: number) => setToasts((current) => current.filter((toast) => toast.id !== id))

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full bg-ink py-2 pr-2 pl-3.5 text-[13px] text-white shadow-float"
              role={toast.tone === "error" ? "alert" : "status"}
            >
              {toast.tone === "error" ? (
                <CircleAlert className="size-4 shrink-0 text-[oklch(0.8_0.12_25)]" />
              ) : (
                <CircleCheck className="size-4 shrink-0 text-brand" />
              )}
              <span className="min-w-0 py-0.5">{toast.message}</span>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick()
                    dismiss(toast.id)
                  }}
                  className="shrink-0 rounded-full bg-white/12 px-3 py-1 font-medium transition-colors hover:bg-white/20"
                >
                  {toast.action.label}
                </button>
              )}
              {!toast.action && <span className="w-1.5" />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ShowToast {
  return useContext(ToastContext)
}
