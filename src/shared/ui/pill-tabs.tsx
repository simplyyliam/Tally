import { useId } from "react"
import { motion } from "motion/react"
import { cn } from "@/shared/lib/cn"

interface PillTabsProps<T extends string> {
  tabs: ReadonlyArray<{ id: T; label: string; count?: number; alert?: boolean }>
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}

/**
 * Tabs drawn as text with a soft grey pill behind the active one (the "Home"
 * pill in the sidebar reference). The pill glides between tabs.
 */
export function PillTabs<T extends string>({ tabs, value, onChange, label, className }: PillTabsProps<T>) {
  const groupId = useId()
  return (
    <div role="tablist" aria-label={label} className={cn("scrollbar-none flex items-center gap-0.5 overflow-x-auto", className)}>
      {tabs.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors outline-none",
              "focus-visible:ring-3 focus-visible:ring-ring/30",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={`pill-${groupId}`}
                className="absolute inset-0 rounded-full bg-subtle-strong/80"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "relative tabular text-xs",
                  tab.alert && tab.count > 0 ? "font-semibold text-red-text" : active ? "text-muted-foreground" : "text-faint",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
