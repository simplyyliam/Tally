import type { ReactNode } from "react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

type ShowToast = (
  message: string,
  options?: { tone?: "success" | "error"; action?: { label: string; onClick: () => void } },
) => void

const showToast: ShowToast = (message, options = {}) => {
  const action = options.action ? { label: options.action.label, onClick: options.action.onClick } : undefined
  if (options.tone === "error") toast.error(message, { action, duration: 8000 })
  else toast.success(message, { action, duration: 4500 })
}

/** Mounts the shadcn Sonner toaster, lifted above the phone's bottom bar. */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="bottom-center" mobileOffset={{ bottom: 92 }} offset={{ bottom: 24 }} />
    </>
  )
}

/** Quiet confirmations ("Loan saved") with an optional Undo. */
export function useToast(): ShowToast {
  return showToast
}
