import { useId } from "react"
import { motion } from "motion/react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/shared/lib/cn"

interface PillTabsProps<T extends string> {
  tabs: ReadonlyArray<{ id: T; label: string; count?: number; alert?: boolean }>
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}

/**
 * shadcn Tabs used as a filter: plain text with a soft grey pill behind the
 * active tab (the "Home" pill in the sidebar reference). The pill slides to
 * the tab you pick, so it's always clear which view you're on.
 */
export function PillTabs<T extends string>({ tabs, value, onChange, label, className }: PillTabsProps<T>) {
  const groupId = useId()
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as T)} className={cn("min-w-0", className)}>
      <TabsList aria-label={label} className="scrollbar-none h-9 w-full justify-start gap-0.5 overflow-x-auto rounded-none bg-transparent p-0">
        {tabs.map((tab) => {
          const active = tab.id === value
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="relative h-8 flex-none rounded-full px-3 text-[13px] text-muted-foreground transition-colors duration-200 hover:text-foreground data-active:bg-transparent data-active:text-foreground data-active:shadow-none dark:data-active:bg-transparent"
            >
              {active && (
                <motion.span
                  layoutId={`tab-pill-${groupId}`}
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-subtle-strong dark:bg-input/40"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative">{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn("relative tabular text-xs text-faint", tab.alert && tab.count > 0 && "font-semibold text-red-text")}>
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
