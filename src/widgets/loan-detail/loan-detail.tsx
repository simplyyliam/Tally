import type { ReactNode } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CalendarPlus, FileQuestion, Pencil, Trash2 } from "lucide-react"
import {
  BorrowerName,
  ExtensionMark,
  LoanStatusPill,
  ReturnButton,
  lineStatus,
  loanStatus,
  overdueDays,
  remainingQuantity,
  useLoanActions,
  useLoanEditor,
  useLoans,
  type Loan,
} from "@/features/loans"
import { DEFAULT_REMINDER_TEMPLATE, WhatsAppButton, reminderPhoneForLoan, reminderTextForLoan } from "@/features/reminders"
import { cn } from "@/shared/lib/cn"
import { formatDate, formatDateTime, formatRelativeDay, todayIso } from "@/shared/lib/dates"
import { formatPhone } from "@/shared/lib/phone"
import { Button } from "@/shared/ui/button"
import { Panel } from "@/shared/ui/card"
import { EmptyState } from "@/shared/ui/empty-state"
import { Skeleton } from "@/shared/ui/loading"
import { PageHeader } from "@/shared/ui/page-header"

/** Everything about one loan, with the handover actions at the top. */
export function LoanDetail() {
  const { loanId } = useParams()
  const { data: loans, loading } = useLoans()
  const navigate = useNavigate()
  const loan = loans?.find((candidate) => candidate.id === loanId)

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (!loan) {
    return (
      <EmptyState
        icon={<FileQuestion />}
        title="Loan not found"
        description="It may have been deleted or purged."
        action={<Button onClick={() => navigate("/loans")}>Back to loans</Button>}
      />
    )
  }
  return <LoanDetailView loan={loan} />
}

function LoanDetailView({ loan }: { loan: Loan }) {
  const navigate = useNavigate()
  const { requestExtend, requestDelete } = useLoanActions()
  const { openEdit } = useLoanEditor()
  const today = todayIso()
  const status = loanStatus(loan, today)
  const isOpen = status !== "returned"

  return (
    <>
      <PageHeader
        title={loan.borrower.name}
        breadcrumbs={[
          { label: "Dashboard", to: "/" },
          { label: "Loans", to: "/loans" },
        ]}
        actions={
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" onClick={() => openEdit(loan.id)}>
              <Pencil />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => requestDelete([loan], () => navigate("/loans"))} className="hover:text-red-text">
              <Trash2 />
              Delete
            </Button>
          </div>
        }
      />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 md:px-6 md:py-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <BorrowerName loan={loan} status={status} className="text-2xl font-semibold tracking-tight" />
              <LoanStatusPill status={status} overdueDays={overdueDays(loan, today)} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Due {formatDate(loan.expectedReturnDate)}
              {isOpen && ` · ${formatRelativeDay(loan.expectedReturnDate, today)}`}
            </p>
          </div>
          {isOpen && (
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <ReturnButton loan={loan} size="md" className="max-sm:h-11" />
              <WhatsAppButton
                size="md"
                phone={reminderPhoneForLoan(loan)}
                text={reminderTextForLoan(loan, DEFAULT_REMINDER_TEMPLATE, today)}
                className="max-sm:h-11"
              />
              <Button size="md" onClick={() => requestExtend(loan)} className="max-sm:col-span-2 max-sm:h-11">
                <CalendarPlus />
                Extend
              </Button>
            </div>
          )}
        </section>

        <Panel title="Items" description={`${loan.lines.length} line${loan.lines.length === 1 ? "" : "s"}`}>
          <ul className="divide-y divide-border">
            {loan.lines.map((line) => {
              const lineState = lineStatus(line, loan, today)
              return (
                <li key={line.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-10 shrink-0 text-sm font-medium tabular">{line.quantity} ×</span>
                  <span className={cn("min-w-0 flex-1 truncate text-sm", lineState === "returned" && "text-muted-foreground line-through")}>
                    {line.description}
                  </span>
                  {line.quantityReturned > 0 && remainingQuantity(line) > 0 && (
                    <span className="text-xs text-muted-foreground tabular">{line.quantityReturned} back</span>
                  )}
                  <LoanStatusPill status={lineState} size="sm" />
                </li>
              )
            })}
          </ul>
        </Panel>

        <div className="grid gap-6 md:grid-cols-2">
          <Panel title="Borrower">
            <dl className="divide-y divide-border text-sm">
              <Row label="Cellphone">{loan.borrower.cellphone ? formatPhone(loan.borrower.cellphone) : "—"}</Row>
              <Row label="WhatsApp">{loan.borrower.whatsapp ? formatPhone(loan.borrower.whatsapp) : "Same as cellphone"}</Row>
              <Row label="Department">{loan.borrower.department || "—"}</Row>
              <Row label="Employee no.">{loan.borrower.employeeNumber || "—"}</Row>
            </dl>
          </Panel>
          <Panel title="Loan">
            <dl className="divide-y divide-border text-sm">
              <Row label="Start date">{formatDate(loan.startDate)}</Row>
              <Row label="Return date">
                <span className="flex items-center justify-end gap-1.5">
                  {formatDate(loan.expectedReturnDate)}
                  <ExtensionMark loan={loan} />
                </span>
              </Row>
              <Row label="Issued by">{loan.issuedBy || "—"}</Row>
              <Row label="Created">{formatDateTime(loan.createdAt)}</Row>
              {loan.returnedAt && <Row label="Returned">{formatDateTime(loan.returnedAt)}</Row>}
            </dl>
          </Panel>
        </div>

        {loan.notes && (
          <Panel title="Notes">
            <p className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">{loan.notes}</p>
          </Panel>
        )}

        <div className="flex gap-2 md:hidden">
          <Button className="h-11 flex-1" onClick={() => openEdit(loan.id)}>
            <Pencil />
            Edit
          </Button>
          <Button variant="danger" className="h-11 flex-1" onClick={() => requestDelete([loan], () => navigate("/loans"))}>
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>
    </>
  )
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  )
}
