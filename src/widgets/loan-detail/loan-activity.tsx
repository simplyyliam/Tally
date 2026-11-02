import { ActivityIcon, sortActivity, useActivity } from "@/features/loans"
import { formatDateTime } from "@/shared/lib/dates"
import { Timeline } from "@/shared/ui/timeline"

/** This loan's activity log, newest first, drawn with the shared Timeline. */
export function LoanActivity({ loanId }: { loanId: string }) {
  const { data: activity = [] } = useActivity()
  const history = sortActivity(activity, loanId)
  if (history.length === 0) return <p className="text-sm text-muted-foreground">No changes recorded yet.</p>
  return (
    <Timeline
      entries={history.map((entry) => ({
        id: entry.id,
        icon: <ActivityIcon kind={entry.kind} />,
        title: entry.detail,
        meta: `${formatDateTime(entry.at)}${entry.staffName ? ` · ${entry.staffName}` : ""}`,
      }))}
    />
  )
}
