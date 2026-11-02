import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { History, PackageOpen, Plus, UserX } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item"
import { WhatsappConsentField, findBorrower, useBorrowerRepository, useBorrowers, useWhatsappConsent, type Borrower } from "@/features/borrowers"
import { LoanList, useLoanEditor } from "@/features/loans"
import { LoanWhatsAppButton } from "@/features/reminders"
import { cn } from "@/shared/lib/cn"
import { formatDate, todayIso } from "@/shared/lib/dates"
import { formatPhone } from "@/shared/lib/phone"
import { initials, plural } from "@/shared/lib/text"
import { TONE_CLASSES } from "@/shared/lib/tones"
import { PageHeader } from "@/shared/ui/page-header"

/** One borrower: who they are, what they have right now, and every loan they've had. */
export function BorrowerProfile() {
  const { borrowerKey = "" } = useParams()
  const { borrowers, loading } = useBorrowers()
  const navigate = useNavigate()
  const borrower = findBorrower(borrowers, decodeURIComponent(borrowerKey))

  if (loading) return null
  if (!borrower) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserX />
          </EmptyMedia>
          <EmptyTitle>Borrower not found</EmptyTitle>
          <EmptyDescription>Their loans may have been deleted or purged.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => navigate("/borrowers")}>
            Back to borrowers
          </Button>
        </EmptyContent>
      </Empty>
    )
  }
  return <ProfileView borrower={borrower} />
}

function ProfileView({ borrower }: { borrower: Borrower }) {
  const navigate = useNavigate()
  const { openNew } = useLoanEditor()
  const borrowerRepository = useBorrowerRepository()
  const hasConsent = useWhatsappConsent()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const today = todayIso()
  const { details } = borrower

  return (
    <>
      <PageHeader
        title={details.name}
        breadcrumbs={[
          { label: "Dashboard", to: "/" },
          { label: "Borrowers", to: "/borrowers" },
        ]}
        actions={
          <Button size="sm" onClick={() => openNew(details)}>
            <Plus data-icon="inline-start" />
            <span className="hidden sm:inline">New loan for {details.name.split(" ")[0]}</span>
          </Button>
        }
      />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 md:px-6 md:py-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar size="lg" className="size-14">
            <AvatarFallback className="text-lg">{initials(details.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className={cn("text-2xl font-semibold tracking-tight", borrower.overdueLoanCount > 0 && "text-red-text")}>{details.name}</h2>
            <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {details.cellphone && <span className="tabular">{formatPhone(details.cellphone)}</span>}
              {details.department && <span>{details.department}</span>}
              {details.employeeNumber && <span>No. {details.employeeNumber}</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("h-7 px-3", borrower.itemsOut > 0 ? TONE_CLASSES.blue : TONE_CLASSES.grey)}>{plural(borrower.itemsOut, "item")} out</Badge>
            {borrower.overdueLoanCount > 0 && <Badge className={cn("h-7 px-3", TONE_CLASSES.red)}>{borrower.overdueLoanCount} overdue</Badge>}
            <Badge variant="outline" className="h-7 px-3">
              {plural(borrower.loans.length, "loan")}
            </Badge>
          </div>
        </section>

        <Card className="rounded-2xl py-4 shadow-none ring-border">
          <CardContent className="px-4">
            <WhatsappConsentField
              id="borrower-whatsapp-consent"
              checked={hasConsent(borrower.key)}
              onCheckedChange={async (consent) => {
                await borrowerRepository.setWhatsappConsent(borrower.key, consent)
                toast.success(consent ? "WhatsApp reminders on" : `${details.name.split(" ")[0]} won't get WhatsApp reminders`)
              }}
            />
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-2xl py-0 shadow-none ring-border">
          <CardHeader className="border-b bg-muted/50 py-3 [.border-b]:pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <PackageOpen className="size-4 text-muted-foreground" />
              Currently out
            </CardTitle>
            <CardDescription className="text-xs">What {details.name.split(" ")[0]} has right now</CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            {borrower.outstanding.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Nothing out. Everything has been returned.</p>
            ) : (
              <ItemGroup className="gap-2">
                {borrower.outstanding.map((item) => (
                  <Item
                    key={`${item.loanId}-${item.description}`}
                    variant="outline"
                    size="sm"
                    render={<button type="button" onClick={() => navigate(`/loans/${item.loanId}`)} />}
                    className="w-full text-left"
                  >
                    <ItemContent>
                      <ItemTitle>
                        <span className="text-muted-foreground tabular">{item.quantity} ×</span> {item.description}
                      </ItemTitle>
                      <ItemDescription className="tabular">{item.reference}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Badge className={item.dueDate < today ? TONE_CLASSES.red : TONE_CLASSES.grey}>Due {formatDate(item.dueDate)}</Badge>
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-none ring-border">
          <CardHeader className="border-b bg-muted/50 py-3 [.border-b]:pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <History className="size-4 text-muted-foreground" />
              Loan history
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <LoanList
              loans={borrower.loans}
              today={today}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onOpen={(loan) => navigate(`/loans/${loan.id}`)}
              renderQuickActions={(loan, status) =>
                status === "returned" ? null : <LoanWhatsAppButton size="icon-sm" loan={loan} today={today} className="max-lg:size-10" />
              }
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
