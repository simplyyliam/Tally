import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { History } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { ACTIVITY_LABELS, ActivityIcon, sortActivity, useActivity, useLoans, type ActivityEntry, type ActivityKind } from "@/features/loans"
import { cn } from "@/shared/lib/cn"
import { dateOfTimestamp, formatDate, formatTime } from "@/shared/lib/dates"
import { TONE_CLASSES, type Tone } from "@/shared/lib/tones"
import { PageHeader } from "@/shared/ui/page-header"

const PAGE_SIZE = 100

const KIND_TONES: Record<ActivityKind, Tone> = {
  create: "blue",
  edit: "grey",
  extend: "purple",
  return: "green",
  "partial-return": "amber",
  delete: "red",
  undo: "grey",
}

/** Everything that happened in the register, newest first, deletes included. */
export function ActivityPage() {
  const { data: activity, loading } = useActivity()
  const { data: loans = [] } = useLoans()
  const navigate = useNavigate()
  const [shown, setShown] = useState(PAGE_SIZE)
  const entries = sortActivity(activity ?? [])
  const existingIds = new Set(loans.map((loan) => loan.id))
  const days = groupByDay(entries.slice(0, shown))

  return (
    <>
      <PageHeader icon={<History />} title="Activity" breadcrumbs={[{ label: "Dashboard", to: "/" }]} />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 md:px-6 md:py-6">
        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : entries.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <History />
              </EmptyMedia>
              <EmptyTitle>Nothing recorded yet</EmptyTitle>
              <EmptyDescription>Issues, returns, extensions, edits and deletes will be listed here with who did them.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          days.map(([day, dayEntries]) => (
            <Card key={day} className="gap-0 rounded-2xl py-0 shadow-none ring-border">
              <CardHeader className="border-b bg-muted/50 py-3 [.border-b]:pb-3">
                <CardTitle className="text-sm font-medium">{formatDate(day)}</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <ul className="divide-y divide-border">
                  {dayEntries.map((entry) => {
                    const canOpen = existingIds.has(entry.loanId)
                    return (
                      <li key={entry.id}>
                        <button
                          type="button"
                          disabled={!canOpen}
                          onClick={() => navigate(`/loans/${entry.loanId}`)}
                          className={cn("flex w-full items-start gap-3 px-4 py-3 text-left", canOpen && "hover:bg-muted/50")}
                        >
                          <ActivityIcon kind={entry.kind} className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                              <span className="font-medium">{entry.borrowerName}</span>
                              <span className="text-xs text-muted-foreground tabular">{entry.reference}</span>
                              <Badge className={TONE_CLASSES[KIND_TONES[entry.kind]]}>{ACTIVITY_LABELS[entry.kind]}</Badge>
                            </span>
                            <span className="mt-0.5 block text-[13px] text-muted-foreground">{entry.detail}</span>
                          </span>
                          <span className="shrink-0 text-right text-xs text-faint tabular">
                            {formatTime(entry.at)}
                            {entry.staffName && <span className="block">{entry.staffName}</span>}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          ))
        )}
        {entries.length > shown && (
          <Button variant="outline" className="self-center" onClick={() => setShown((count) => count + PAGE_SIZE)}>
            Show older
          </Button>
        )}
      </div>
    </>
  )
}

/** [Johannesburg date, entries] pairs, newest day first. */
function groupByDay(entries: ReadonlyArray<ActivityEntry>): [string, ActivityEntry[]][] {
  const days = new Map<string, ActivityEntry[]>()
  for (const entry of entries) {
    const day = dateOfTimestamp(entry.at)
    days.set(day, [...(days.get(day) ?? []), entry])
  }
  return [...days.entries()]
}
