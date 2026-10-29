import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Download, List, Plus, SearchX, Trash2 } from "lucide-react"
import {
  LOAN_SORTS,
  LOAN_TABS,
  LoanList,
  countByTab,
  loansToCsvRows,
  matchesSearch,
  matchesTab,
  sortLoans,
  useLoanActions,
  useLoanEditor,
  useLoans,
  type LoanSort,
  type LoanTab,
} from "@/features/loans"
import { DEFAULT_REMINDER_TEMPLATE, WhatsAppButton, reminderPhoneForLoan, reminderTextForLoan } from "@/features/reminders"
import { toCsv } from "@/shared/lib/csv"
import { fileDateStamp, todayIso } from "@/shared/lib/dates"
import { downloadTextFile } from "@/shared/lib/download"
import { Button } from "@/shared/ui/button"
import { EmptyState } from "@/shared/ui/empty-state"
import { FloatingBar, FloatingBarButton, FloatingBarDivider } from "@/shared/ui/floating-bar"
import { Select } from "@/shared/ui/input"
import { TableSkeleton } from "@/shared/ui/loading"
import { PageHeader } from "@/shared/ui/page-header"
import { PillTabs } from "@/shared/ui/pill-tabs"
import { SearchField } from "@/shared/ui/search-field"

const TAB_IDS = LOAN_TABS.map((tab) => tab.id)

/** The full register: tabs by status, search, sort, CSV export and bulk actions. */
export function LoansRegister() {
  const { data: loans, loading } = useLoans()
  const { openNew } = useLoanEditor()
  const { requestDelete } = useLoanActions()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const searchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<LoanSort>("due-date")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const today = todayIso()

  const tabParam = params.get("tab") as LoanTab | null
  const tab: LoanTab = tabParam && TAB_IDS.includes(tabParam) ? tabParam : "out"

  // Ctrl/⌘+K anywhere lands here with ?focus=search.
  useEffect(() => {
    if (params.get("focus") === "search") {
      searchRef.current?.focus()
      setParams((current) => {
        current.delete("focus")
        return current
      }, { replace: true })
    }
  }, [params, setParams])

  const all = loans ?? []
  const counts = countByTab(all, today)
  const visible = sortLoans(
    all.filter((loan) => matchesTab(loan, tab, today) && matchesSearch(loan, query)),
    tab === "returned" ? "newest" : sort,
    today,
  )
  const selected = visible.filter((loan) => selectedIds.has(loan.id))

  const exportCsv = (target = visible) => {
    downloadTextFile(`tally-loans-${fileDateStamp()}.csv`, toCsv(loansToCsvRows(target, today)), "text/csv;charset=utf-8")
  }

  return (
    <>
      <PageHeader
        icon={<List />}
        title="Loans"
        subtitle={`${counts.out} out · ${counts.returned} returned`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportCsv()} disabled={visible.length === 0} className="hidden sm:inline-flex">
              <Download />
              Export CSV
            </Button>
            <Button variant="primary" size="sm" onClick={() => openNew()} className="hidden sm:inline-flex">
              <Plus />
              New loan
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 md:px-6 lg:flex-row lg:items-center">
        <PillTabs
          label="Filter loans by status"
          value={tab}
          onChange={(next) => {
            setSelectedIds(new Set())
            setParams(next === "out" ? {} : { tab: next })
          }}
          tabs={LOAN_TABS.map((item) => ({ ...item, count: counts[item.id], alert: item.id === "overdue" }))}
          className="-mx-1 flex-1"
        />
        <div className="flex items-center gap-2">
          <SearchField
            ref={searchRef}
            value={query}
            onValueChange={setQuery}
            placeholder="Search name, item, phone…"
            shortcut="Ctrl K"
            className="flex-1 lg:w-72"
            aria-label="Search loans"
          />
          {tab !== "returned" && (
            <Select aria-label="Sort loans" value={sort} onChange={(event) => setSort(event.target.value as LoanSort)} className="w-auto rounded-xl">
              {LOAN_SORTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <TableSkeleton />
        ) : visible.length === 0 ? (
          all.length === 0 ? (
            <EmptyState
              icon={<List />}
              title="The register is empty"
              description="New loans appear here the moment they're saved."
              action={
                <Button variant="primary" size="sm" onClick={() => openNew()}>
                  <Plus />
                  New loan
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<SearchX />}
              title="No loans match"
              description={query ? `Nothing in "${LOAN_TABS.find((item) => item.id === tab)?.label}" matches "${query}".` : "Nothing in this tab right now."}
              action={query ? <Button onClick={() => setQuery("")}>Clear search</Button> : undefined}
            />
          )
        ) : (
          <LoanList
            loans={visible}
            today={today}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onOpen={(loan) => navigate(`/loans/${loan.id}`)}
            renderQuickActions={(loan, status) =>
              status === "returned" ? null : (
                <WhatsAppButton
                  size="icon-sm"
                  phone={reminderPhoneForLoan(loan)}
                  text={reminderTextForLoan(loan, DEFAULT_REMINDER_TEMPLATE, today)}
                  className="max-lg:h-10 max-lg:w-10"
                />
              )
            }
          />
        )}
      </div>

      <FloatingBar open={selected.length > 0}>
        <span className="flex items-center gap-2 pr-1 pl-1.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-blue-text/30 text-xs font-semibold text-[oklch(0.85_0.08_250)] tabular">
            {selected.length}
          </span>
          <span className="hidden text-white/70 sm:inline">of {visible.length} selected</span>
        </span>
        {selected.length < visible.length && (
          <FloatingBarButton tone="link" onClick={() => setSelectedIds(new Set(visible.map((loan) => loan.id)))}>
            Select all
          </FloatingBarButton>
        )}
        <FloatingBarDivider />
        <FloatingBarButton icon={<Download />} onClick={() => exportCsv(selected)}>
          <span className="hidden sm:inline">Export CSV</span>
        </FloatingBarButton>
        <FloatingBarButton tone="danger" icon={<Trash2 />} onClick={() => requestDelete(selected, () => setSelectedIds(new Set()))}>
          <span className="hidden sm:inline">Delete</span>
        </FloatingBarButton>
      </FloatingBar>
    </>
  )
}
