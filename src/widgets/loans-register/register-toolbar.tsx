import { useId, type Ref } from "react"
import { motion } from "motion/react"
import { ArrowDownUp, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LOAN_SORTS, LOAN_TABS, type LoanSort, type LoanTab } from "@/features/loans"
import { cn } from "@/shared/lib/cn"

/**
 * Status tabs as shadcn Tabs. A soft grey pill sits behind the active tab
 * (the "Home" pill in the sidebar reference) and slides to the tab you pick.
 */
export function StatusTabs({ value, counts, onChange }: { value: LoanTab; counts: Record<LoanTab, number>; onChange: (tab: LoanTab) => void }) {
  const groupId = useId()
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as LoanTab)} className="-mx-1 min-w-0 flex-1">
      <TabsList aria-label="Filter loans by status" className="scrollbar-none h-9 w-full justify-start gap-0.5 overflow-x-auto bg-transparent p-0">
        {LOAN_TABS.map((tab) => {
          const active = tab.id === value
          const count = counts[tab.id]
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="relative h-8 flex-none px-3 text-[13px] text-muted-foreground hover:text-foreground data-active:bg-transparent data-active:text-foreground data-active:shadow-none dark:data-active:bg-transparent"
            >
              {active && (
                <motion.span
                  layoutId={`tab-pill-${groupId}`}
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-muted"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative">{tab.label}</span>
              <span className={cn("relative text-xs text-muted-foreground tabular", tab.id === "overdue" && count > 0 && "font-semibold text-destructive")}>
                {count}
              </span>
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}

/** The search box from the table reference: shadcn InputGroup with a keyboard hint. */
export function SearchBox({ value, onChange, ref }: { value: string; onChange: (value: string) => void; ref?: Ref<HTMLInputElement> }) {
  return (
    <InputGroup className="flex-1 lg:w-72">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        ref={ref}
        type="search"
        aria-label="Search loans"
        placeholder="Search name, item, phone…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="[&::-webkit-search-cancel-button]:hidden"
      />
      <InputGroupAddon align="inline-end">
        {value ? (
          <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => onChange("")}>
            <X />
          </InputGroupButton>
        ) : (
          <Kbd className="hidden md:inline-flex">Ctrl K</Kbd>
        )}
      </InputGroupAddon>
    </InputGroup>
  )
}

/** Sort order picked from a shadcn DropdownMenu radio group. */
export function SortMenu({ value, onChange }: { value: LoanSort; onChange: (sort: LoanSort) => void }) {
  const current = LOAN_SORTS.find((option) => option.id === value)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" aria-label={`Sort loans: ${current?.label}`} />}>
        <ArrowDownUp data-icon="inline-start" />
        <span className="hidden sm:inline">{current?.label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value} onValueChange={(next) => onChange(next as LoanSort)}>
            {LOAN_SORTS.map((option) => (
              <DropdownMenuRadioItem key={option.id} value={option.id}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
