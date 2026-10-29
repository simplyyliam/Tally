import type { ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { CalendarPlus, Ellipsis, Pencil, Trash2, Undo2 } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

const MotionRow = motion.create(TableRow)

function LoanTable({ loans, today, selectedIds, onSelectionChange, onOpen, renderQuickActions }: LoanListProps) {
  const allSelected = loans.length > 0 && loans.every((loan) => selectedIds.has(loan.id))
  const someSelected = !allSelected && loans.some((loan) => selectedIds.has(loan.id))

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="bg-sidebar text-[13px] hover:bg-sidebar">
          <TableHead className="h-10 w-12 pl-4">
            <Checkbox
              aria-label="Select all loans"
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={(checked) => onSelectionChange(checked ? new Set(loans.map((loan) => loan.id)) : new Set())}
            />
          </TableHead>
          <TableHead className="h-10 w-[24%] font-normal text-muted-foreground">Borrower</TableHead>
          <TableHead className="h-10 font-normal text-muted-foreground">Items</TableHead>
          <TableHead className="h-10 w-[17%] font-normal text-muted-foreground">Return date</TableHead>
          <TableHead className="h-10 w-[13%] font-normal text-muted-foreground">Status</TableHead>
          <TableHead className="h-10 w-[200px] pr-4 text-right font-normal text-muted-foreground">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <AnimatePresence initial={false}>
          {loans.map((loan) => {
            const status = loanStatus(loan, today)
            const selected = selectedIds.has(loan.id)
            return (
              <MotionRow
                key={loan.id}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => onOpen(loan)}
                data-state={selected ? "selected" : undefined}
                className="group cursor-pointer hover:bg-sidebar data-[state=selected]:bg-blue-tint/40"
              >
                <TableCell className="pl-4" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    aria-label={`Select loan for ${loan.borrower.name}`}
                    checked={selected}
                    onCheckedChange={() => onSelectionChange(toggle(selectedIds, loan.id))}
                  />
                </TableCell>
                <TableCell className="whitespace-normal">
                  <BorrowerName loan={loan} status={status} />
                  <p className="truncate text-xs text-muted-foreground">{loan.borrower.department || loan.borrower.cellphone || "—"}</p>
                </TableCell>
                <TableCell>
                  <ItemsSummary loan={loan} />
                </TableCell>
                <TableCell className="whitespace-normal">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="tabular">{formatDate(loan.expectedReturnDate)}</span>
                    <ExtensionMark loan={loan} />
                  </div>
                  {status !== "returned" && <p className="text-xs text-muted-foreground">{formatRelativeDay(loan.expectedReturnDate, today)}</p>}
                </TableCell>
                <TableCell>
                  <LoanStatusPill status={status} overdueDays={overdueDays(loan, today)} />
                </TableCell>
                <TableCell className="pr-4" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {renderQuickActions?.(loan, status)}
                    <RowActions loan={loan} status={status} />
                  </div>
                </TableCell>
              </MotionRow>
            )
          })}
        </AnimatePresence>
      </TableBody>
    </Table>
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
                    aria-label={`Select loan for ${loan.borrower.name}`}
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
