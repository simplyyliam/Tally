import type { ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { borrowerKey } from "@/features/borrowers"
import { CalendarPlus, CircleCheck, FilePlus2, PackageOpen, FileQuestion, Pencil, Trash2 } from "lucide-react"
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
import { LoanWhatsAppButton } from "@/features/reminders"
import { cn } from "@/shared/lib/cn"
import { formatDate, formatDateTime, formatRelativeDay, todayIso } from "@/shared/lib/dates"
import { formatPhone } from "@/shared/lib/phone"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/shared/ui/page-header"
import { Timeline, type TimelineEntry } from "@/shared/ui/timeline"

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
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion />
          </EmptyMedia>
          <EmptyTitle>Loan not found</EmptyTitle>
          <EmptyDescription>It may have been deleted or purged.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => navigate("/loans")}>
            Back to loans
          </Button>
        </EmptyContent>
      </Empty>
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
              <Pencil data-icon="inline-start" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => requestDelete([loan], () => navigate("/loans"))} className="hover:text-destructive">
              <Trash2 data-icon="inline-start" />
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
              <Badge variant="outline" className="tabular">
                {loan.reference}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Due {formatDate(loan.expectedReturnDate)}
              {isOpen && ` · ${formatRelativeDay(loan.expectedReturnDate, today)}`}
            </p>
          </div>
          {isOpen && (
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <ReturnButton loan={loan} size="lg" />
              <LoanWhatsAppButton size="lg" loan={loan} today={today} />
              <Button variant="outline" size="lg" onClick={() => requestExtend(loan)} className="max-sm:col-span-2">
                <CalendarPlus data-icon="inline-start" />
                Extend
              </Button>
            </div>
          )}
        </section>

        <InfoCard title="Items" description={`${loan.lines.length} line${loan.lines.length === 1 ? "" : "s"}`}>
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
        </InfoCard>

        <div className="grid gap-6 md:grid-cols-2">
          <InfoCard title="Borrower">
            <dl className="divide-y divide-border text-sm">
              <Row label="Cellphone">{loan.borrower.cellphone ? formatPhone(loan.borrower.cellphone) : "—"}</Row>
              <Row label="WhatsApp">{loan.borrower.whatsapp ? formatPhone(loan.borrower.whatsapp) : "Same as cellphone"}</Row>
              <Row label="Department">{loan.borrower.department || "—"}</Row>
              <Row label="Employee no.">{loan.borrower.employeeNumber || "—"}</Row>
              <Row label="History">
                <Link to={`/borrowers/${encodeURIComponent(borrowerKey(loan.borrower))}`} className="font-medium underline-offset-4 hover:underline">
                  All loans for {loan.borrower.name.split(" ")[0]}
                </Link>
              </Row>
            </dl>
          </InfoCard>
          <InfoCard title="Loan">
            <dl className="divide-y divide-border text-sm">
              <Row label="Start date">{formatDate(loan.startDate)}</Row>
              <Row label="Return date">
                <span className="flex items-center justify-end gap-1.5">
                  {formatDate(loan.expectedReturnDate)}
                  <ExtensionMark loan={loan} />
                </span>
              </Row>
              <Row label="Issued by">{loan.issuedBy || "—"}</Row>
            </dl>
          </InfoCard>
        </div>

        <InfoCard title="Timestamps" description="Every handover moment, in Johannesburg time">
          <div className="px-4 py-4">
            <Timeline entries={timestampEntries(loan)} />
          </div>
        </InfoCard>

        {loan.notes && (
          <InfoCard title="Notes">
            <p className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">{loan.notes}</p>
          </InfoCard>
        )}

        <div className="flex gap-2 md:hidden">
          <Button variant="outline" size="lg" className="flex-1" onClick={() => openEdit(loan.id)}>
            <Pencil data-icon="inline-start" />
            Edit
          </Button>
          <Button variant="destructive" size="lg" className="flex-1" onClick={() => requestDelete([loan], () => navigate("/loans"))}>
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </div>
    </>
  )
}

/** A titled shadcn Card, the grey header echoing the "Outcome" reference. */
function InfoCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card className="gap-0 rounded-2xl py-0 shadow-none ring-border">
      <CardHeader className="border-b bg-muted/50 py-3 [.border-b]:pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-0">{children}</CardContent>
    </Card>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  )
}

/** Created, issued, each extension and the return, oldest first. */
function timestampEntries(loan: Loan): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    { id: "created", icon: <FilePlus2 />, title: "Created in Tally", meta: formatDateTime(loan.createdAt) },
    { id: "issued", icon: <PackageOpen />, title: `Issued${loan.issuedBy ? ` by ${loan.issuedBy}` : ""}`, meta: formatDateTime(loan.issuedAt) },
    ...loan.extendedAt.map((at, index) => ({
      id: `extended-${index}`,
      icon: <CalendarPlus />,
      title: "Return date extended",
      meta: formatDateTime(at),
    })),
  ]
  if (loan.returnedAt) {
    entries.push({ id: "returned", icon: <CircleCheck />, title: "Everything returned", meta: formatDateTime(loan.returnedAt) })
  }
  return entries
}
