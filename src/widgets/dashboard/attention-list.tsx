import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import { BorrowerName, ItemsSummary, LoanStatusPill, ReturnButton, loanStatus, overdueDays, type Loan } from "@/features/loans"
import { DEFAULT_REMINDER_TEMPLATE, WhatsAppButton, reminderPhoneForLoan, reminderTextForLoan } from "@/features/reminders"
import { formatDate, type IsoDate } from "@/shared/lib/dates"
import { Panel } from "@/shared/ui/card"
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
    <Panel
      title={
        <span className="flex items-center gap-2">
          {title}
          <span className="text-xs font-normal text-faint tabular">{loans.length}</span>
        </span>
      }
      className={className}
    >
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
                  <div className={cn("flex shrink-0 items-center gap-2")}>
                    <WhatsAppButton
                      phone={reminderPhoneForLoan(loan)}
                      text={reminderTextForLoan(loan, DEFAULT_REMINDER_TEMPLATE, today)}
                      className="h-10 flex-1 sm:h-8 sm:flex-none"
                    />
                    <ReturnButton loan={loan} className="h-10 flex-1 sm:h-8 sm:flex-none" />
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </Panel>
  )
}
