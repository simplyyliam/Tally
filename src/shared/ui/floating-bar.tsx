import type { ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"

interface FloatingBarProps {
  open: boolean
  children: ReactNode
}

/** The dark "3 of 50 selected" bar from the bulk-selection reference; it springs up from the bottom. */
export function FloatingBar({ open, children }: FloatingBarProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="toolbar"
          aria-label="Bulk actions"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.15 } }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 mx-auto flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full bg-ink p-1.5 text-[13px] text-white shadow-float lg:bottom-6"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function FloatingBarDivider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-white/15" />
}

export function FloatingBarButton({
  onClick,
  icon,
  children,
  tone = "default",
}: {
  onClick: () => void
  icon?: ReactNode
  children: ReactNode
  tone?: "default" | "danger" | "link"
}) {
  const tones = {
    default: "bg-white/10 hover:bg-white/18 text-white",
    danger: "bg-red-text/25 text-[oklch(0.8_0.12_25)] hover:bg-red-text/35",
    link: "text-[oklch(0.78_0.11_250)] hover:bg-white/8",
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 font-medium transition-[background-color,transform] duration-150 active:scale-[0.97] [&_svg]:size-4 ${tones[tone]}`}
    >
      {icon}
      {children}
    </button>
  )
}
