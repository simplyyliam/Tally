import { useNavigate } from "react-router-dom"
import { CalendarClock, CircleAlert, Home, Package, Plus, Undo2 } from "lucide-react"
import { isDueTomorrow, loanStatus, outstandingQuantity, sortLoans, useLoanEditor, useLoans, overdueDays } from "@/features/loans"
import { useSettings } from "@/features/settings"
import { todayIso } from "@/shared/lib/dates"
import { Button } from "@/shared/ui/button"
import { Panel } from "@/shared/ui/card"
import { EmptyState } from "@/shared/ui/empty-state"
import { Skeleton } from "@/shared/ui/loading"
import { PageHeader } from "@/shared/ui/page-header"
import { StatCell } from "./stat-cell"
import { AttentionList } from "./attention-list"

/** The first screen: what's out, what's late, and who to remind — with Issue and Return one tap away. */
export function Dashboard() {
  const { data: loans, loading } = useLoans()
  const { openNew } = useLoanEditor()
  const settings = useSettings()
  const navigate = useNavigate()
  const today = todayIso()

  const open = (loans ?? []).filter((loan) => loanStatus(loan, today) !== "returned")
  const overdue = sortLoans(
    open.filter((loan) => loanStatus(loan, today) === "overdue"),
    "overdue-days",
    today,
  )
  const dueToday = open.filter((loan) => loanStatus(loan, today) === "due-today")
  const dueTomorrow = open.filter((loan) => isDueTomorrow(loan, today))
  const itemsOut = open.reduce((sum, loan) => sum + outstandingQuantity(loan), 0)
  const longestOverdue = overdue[0] ? overdueDays(overdue[0], today) : 0

  return (
    <>
      <PageHeader
        icon={<Home />}
        title="Dashboard"
        subtitle={greeting(settings.staffName)}
        actions={
          <Button variant="primary" size="sm" onClick={() => openNew()} className="hidden sm:inline-flex">
            <Plus />
            New loan
          </Button>
        }
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-6">
        <Panel title="Right now" bodyClassName="grid grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex flex-col gap-3 bg-card p-5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-7 w-12" />
              </div>
            ))
          ) : (
            <>
              <StatCell label="Loans out" value={open.length} icon={<Package />} hint={`${itemsOut} items with borrowers`} onClick={() => navigate("/loans")} />
              <StatCell
                label="Overdue"
                value={overdue.length}
                icon={<CircleAlert />}
                tone={overdue.length > 0 ? "red" : undefined}
                hint={overdue.length > 0 ? `Longest ${longestOverdue} days` : "Nothing late"}
                onClick={() => navigate("/loans?tab=overdue")}
              />
              <StatCell
                label="Due today"
                value={dueToday.length}
                icon={<CalendarClock />}
                tone={dueToday.length > 0 ? "amber" : undefined}
                hint="Expected back today"
                onClick={() => navigate("/loans?tab=due-today")}
              />
              <StatCell
                label="Due tomorrow"
                value={dueTomorrow.length}
                icon={<Undo2 />}
                hint="Worth a reminder"
                onClick={() => navigate("/loans?tab=due-tomorrow")}
              />
            </>
          )}
        </Panel>

        {!loading && loans && loans.length === 0 ? (
          <EmptyState
            icon={<Package />}
            title="No loans yet"
            description="Register the first handover and it will show up here. Everything is saved in this browser — no account needed."
            action={
              <Button variant="primary" size="sm" onClick={() => openNew()}>
                <Plus />
                New loan
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <AttentionList
              title="Overdue"
              loans={overdue}
              today={today}
              emptyText="Nothing overdue. Everything's where it should be."
              className="lg:col-span-2"
            />
            <AttentionList title="Due today" loans={dueToday} today={today} emptyText="Nothing due back today." />
            <AttentionList title="Due tomorrow" loans={dueTomorrow} today={today} emptyText="Nothing due tomorrow." />
          </div>
        )}
      </div>
    </>
  )
}

function greeting(name: string): string {
  const hour = Number(new Intl.DateTimeFormat("en-ZA", { hour: "numeric", hour12: false, timeZone: "Africa/Johannesburg" }).format(new Date()))
  const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const first = name.trim().split(/\s+/)[0]
  return first ? `${part}, ${first}` : part
}
