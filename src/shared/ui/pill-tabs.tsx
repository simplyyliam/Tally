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
 * active tab (the "Home" pill in the sidebar reference) and a count beside each.
 */
export function PillTabs<T extends string>({ tabs, value, onChange, label, className }: PillTabsProps<T>) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as T)} className={cn("min-w-0", className)}>
      <TabsList aria-label={label} className="scrollbar-none h-9 w-full justify-start gap-0.5 overflow-x-auto rounded-none bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="h-8 flex-none rounded-full px-3 text-[13px] text-muted-foreground transition-[background-color,color] duration-200 hover:bg-muted data-active:bg-subtle-strong data-active:text-foreground data-active:shadow-none dark:data-active:bg-input/40"
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn("tabular text-xs text-faint", tab.alert && tab.count > 0 && "font-semibold text-red-text")}>
                {tab.count}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
