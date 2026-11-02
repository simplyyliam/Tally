import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import { BorrowerName, ItemsSummary, LoanStatusPill, ReturnButton, loanStatus, overdueDays, type Loan } from "@/features/loans"
import { LoanWhatsAppButton } from "@/features/reminders"
import { formatDate, type IsoDate } from "@/shared/lib/dates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/shared/lib/cn"

interface AttentionListProps {
  title: string
  loans: ReadonlyArray<Loan>
  today: IsoDate
  emptyText: string
  className?: string
}

/** A short dashboard list with Return and WhatsApp right on each row. */
export function AttentionList({ title, loans, today, emptyText, className }: AttentionListProps) {
  const navigate = useNavigate()
  return (
    <Card className={cn("gap-0 rounded-2xl py-0 shadow-none ring-border", className)}>
      <CardHeader className="border-b bg-muted/50 py-3 [.border-b]:pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {title}
          <span className="text-xs font-normal text-muted-foreground tabular">{loans.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
      {loans.length === 0 ? (
        <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-border">
          <AnimatePresence initial={false}>
            {loans.map((loan) => {
              const status = loanStatus(loan, today)
              return (
                <motion.li
                  key={loan.id}
                  layout="position"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 12, transition: { duration: 0.18 } }}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"
                >
                  <button type="button" onClick={() => navigate(`/loans/${loan.id}`)} className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <BorrowerName loan={loan} status={status} className="text-sm" />
                      {status === "overdue" && <LoanStatusPill status={status} overdueDays={overdueDays(loan, today)} size="sm" />}
                    </div>
                    <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
                      <ItemsSummary loan={loan} />
                      <span aria-hidden className="text-faint">·</span>
                      <span className="shrink-0">{formatDate(loan.expectedReturnDate)}</span>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <LoanWhatsAppButton
                      loan={loan}
                      today={today}
                      className="max-sm:h-10 max-sm:flex-1"
                    />
                    <ReturnButton loan={loan} className="max-sm:h-10 max-sm:flex-1" />
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
      </CardContent>
    </Card>
  )
}
