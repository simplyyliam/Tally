import type { ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { CalendarPlus, Ellipsis, Pencil, Trash2, Undo2 } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Menu } from "@/shared/ui/menu"
import { cn } from "@/shared/lib/cn"
import { formatDate, formatRelativeDay, type IsoDate } from "@/shared/lib/dates"
import type { Loan } from "../domain/loan"
import { loanStatus, overdueDays, type LoanStatus } from "../domain/status"
import { BorrowerName, ItemsSummary } from "./loan-bits"
import { ExtensionMark, LoanStatusPill } from "./status-pill"
import { useLoanActions } from "./loan-actions-context"
import { useLoanEditor } from "./loan-editor-context"

interface LoanListProps {
  loans: ReadonlyArray<Loan>
  today: IsoDate
  selectedIds: ReadonlySet<string>
  onSelectionChange: (ids: Set<string>) => void
  onOpen: (loan: Loan) => void
  /** Extra one-tap actions per loan, e.g. the WhatsApp button wired by a widget. */
  renderQuickActions?: (loan: Loan, status: LoanStatus) => ReactNode
}

/**
 * The register. A wide, scannable table on desktop; stacked cards on a phone
 * with Return and WhatsApp as large tap targets.
 */
export function LoanList(props: LoanListProps) {
  return (
    <>
      <div className="hidden lg:block">
        <LoanTable {...props} />
      </div>
      <div className="lg:hidden">
        <LoanCards {...props} />
      </div>
    </>
  )
}

function toggle(ids: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(ids)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

function LoanTable({ loans, today, selectedIds, onSelectionChange, onOpen, renderQuickActions }: LoanListProps) {
  const allSelected = loans.length > 0 && loans.every((loan) => selectedIds.has(loan.id))
  const someSelected = !allSelected && loans.some((loan) => selectedIds.has(loan.id))

  return (
    <table className="w-full table-fixed border-collapse text-sm">
      <thead>
        <tr className="border-b border-border bg-sidebar text-left text-[13px] text-muted-foreground">
          <th className="w-12 py-2.5 pl-4 font-normal">
            <Checkbox
              label="Select all loans"
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={(checked) => onSelectionChange(checked ? new Set(loans.map((loan) => loan.id)) : new Set())}
            />
          </th>
          <th className="w-[24%] py-2.5 pr-4 font-normal">Borrower</th>
          <th className="py-2.5 pr-4 font-normal">Items</th>
          <th className="w-[17%] py-2.5 pr-4 font-normal">Return date</th>
          <th className="w-[13%] py-2.5 pr-4 font-normal">Status</th>
          <th className="w-[200px] py-2.5 pr-4 text-right font-normal">Actions</th>
        </tr>
      </thead>
      <tbody>
        <AnimatePresence initial={false}>
          {loans.map((loan) => {
            const status = loanStatus(loan, today)
            const selected = selectedIds.has(loan.id)
            return (
              <motion.tr
                key={loan.id}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => onOpen(loan)}
                className={cn(
                  "group cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-sidebar",
                  selected && "bg-blue-tint/40 hover:bg-blue-tint/60",
                )}
              >
                <td className="py-3 pl-4" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    label={`Select loan for ${loan.borrower.name}`}
                    checked={selected}
                    onCheckedChange={() => onSelectionChange(toggle(selectedIds, loan.id))}
                  />
                </td>
                <td className="py-3 pr-4">
                  <BorrowerName loan={loan} status={status} />
                  <p className="truncate text-xs text-muted-foreground">{loan.borrower.department || loan.borrower.cellphone || "—"}</p>
                </td>
                <td className="py-3 pr-4">
                  <ItemsSummary loan={loan} />
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="tabular">{formatDate(loan.expectedReturnDate)}</span>
                    <ExtensionMark loan={loan} />
                  </div>
                  {status !== "returned" && <p className="text-xs text-muted-foreground">{formatRelativeDay(loan.expectedReturnDate, today)}</p>}
                </td>
                <td className="py-3 pr-4">
                  <LoanStatusPill status={status} overdueDays={overdueDays(loan, today)} />
                </td>
                <td className="py-3 pr-4" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {renderQuickActions?.(loan, status)}
                    <RowActions loan={loan} status={status} />
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </AnimatePresence>
      </tbody>
    </table>
  )
}

function LoanCards({ loans, today, selectedIds, onSelectionChange, onOpen, renderQuickActions }: LoanListProps) {
  const selecting = selectedIds.size > 0
  return (
    <ul className="divide-y divide-border">
      <AnimatePresence initial={false}>
        {loans.map((loan) => {
          const status = loanStatus(loan, today)
          const selected = selectedIds.has(loan.id)
          return (
            <motion.li
              key={loan.id}
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn("px-4 py-3.5", selected && "bg-blue-tint/40")}
            >
              <div className="flex items-start gap-3">
                <div className="pt-0.5">
                  <Checkbox
                    label={`Select loan for ${loan.borrower.name}`}
                    checked={selected}
                    onCheckedChange={() => onSelectionChange(toggle(selectedIds, loan.id))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => (selecting ? onSelectionChange(toggle(selectedIds, loan.id)) : onOpen(loan))}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <BorrowerName loan={loan} status={status} />
                    <LoanStatusPill status={status} overdueDays={overdueDays(loan, today)} size="sm" />
                  </div>
                  <div className="mt-1">
                    <ItemsSummary loan={loan} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Due {formatDate(loan.expectedReturnDate)}</span>
                    <ExtensionMark loan={loan} />
                  </div>
                </button>
              </div>
              {status !== "returned" && (
                <div className="mt-3 flex items-center gap-2 pl-[30px]">
                  <ReturnButton loan={loan} className="h-10 flex-1" />
                  {renderQuickActions?.(loan, status)}
                  <RowActions loan={loan} status={status} large />
                </div>
              )}
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ul>
  )
}

export function ReturnButton({ loan, className, size = "sm" }: { loan: Loan; className?: string; size?: "sm" | "md" | "lg" }) {
  const { returnLoans } = useLoanActions()
  return (
    <Button variant="primary" size={size} className={className} onClick={() => void returnLoans([loan])}>
      <Undo2 />
      Return
    </Button>
  )
}

function RowActions({ loan, status, large }: { loan: Loan; status: LoanStatus; large?: boolean }) {
  const { requestExtend, requestDelete } = useLoanActions()
  const { openEdit } = useLoanEditor()
  const open = status !== "returned"
  return (
    <>
      {open && !large && <ReturnButton loan={loan} />}
      <Menu
        trigger={
          <Button variant="ghost" size={large ? "icon" : "icon-sm"} aria-label="More actions" className={large ? "h-10 w-10" : undefined}>
            <Ellipsis />
          </Button>
        }
        actions={[
          ...(open ? [{ label: "Extend return date", icon: <CalendarPlus />, onSelect: () => requestExtend(loan) }] : []),
          { label: "Edit loan", icon: <Pencil />, onSelect: () => openEdit(loan.id) },
          "separator" as const,
          { label: "Delete", icon: <Trash2 />, tone: "danger" as const, onSelect: () => requestDelete([loan]) },
        ]}
      />
    </>
  )
}
