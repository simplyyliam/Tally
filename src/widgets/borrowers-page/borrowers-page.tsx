import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { ChevronRight, Search, Users } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useBorrowers, type Borrower } from "@/features/borrowers"
import { cn } from "@/shared/lib/cn"
import { formatDateTime } from "@/shared/lib/dates"
import { formatPhone } from "@/shared/lib/phone"
import { initials, normalizeName } from "@/shared/lib/text"
import { TONE_CLASSES } from "@/shared/lib/tones"
import { PageHeader } from "@/shared/ui/page-header"

/** Everyone who has borrowed, worked out from the loans, with what each still has. */
export function BorrowersPage() {
  const { borrowers, loading } = useBorrowers()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const typed = normalizeName(query)
  const visible = borrowers.filter((borrower) =>
    normalizeName([borrower.details.name, borrower.details.department, borrower.details.cellphone, borrower.details.employeeNumber].join(" ")).includes(typed),
  )
  const open = (borrower: Borrower) => navigate(`/borrowers/${encodeURIComponent(borrower.key)}`)

  return (
    <>
      <PageHeader icon={<Users />} title="Borrowers" breadcrumbs={[{ label: "Dashboard", to: "/" }]} subtitle={`${borrowers.length} people`} />
      <div className="border-b px-4 py-3 md:px-6">
        <InputGroup className="max-w-sm">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput type="search" aria-label="Search borrowers" placeholder="Search name, department, phone…" value={query} onChange={(event) => setQuery(event.target.value)} />
        </InputGroup>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 p-6">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>{borrowers.length === 0 ? "No borrowers yet" : "Nobody matches"}</EmptyTitle>
            <EmptyDescription>
              {borrowers.length === 0 ? "Borrowers appear here automatically once you register a loan." : `No borrower matches "${query}".`}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Table className="hidden lg:table">
            <TableHeader>
              <TableRow className="bg-sidebar hover:bg-sidebar">
                <TableHead className="pl-6 font-normal text-muted-foreground">Borrower</TableHead>
                <TableHead className="font-normal text-muted-foreground">Cellphone</TableHead>
                <TableHead className="font-normal text-muted-foreground">Items out</TableHead>
                <TableHead className="font-normal text-muted-foreground">Loans</TableHead>
                <TableHead className="pr-6 font-normal text-muted-foreground">Last loan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((borrower) => (
                <TableRow key={borrower.key} className="cursor-pointer" onClick={() => open(borrower)}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>{initials(borrower.details.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className={cn("truncate font-medium", borrower.overdueLoanCount > 0 && "text-red-text")}>{borrower.details.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{borrower.details.department || "—"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="tabular">{borrower.details.cellphone ? formatPhone(borrower.details.cellphone) : "—"}</TableCell>
                  <TableCell>
                    <ItemsOutBadge borrower={borrower} />
                  </TableCell>
                  <TableCell className="tabular">{borrower.loans.length}</TableCell>
                  <TableCell className="pr-6 text-muted-foreground tabular">{formatDateTime(borrower.lastLoanAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <ItemGroup className="gap-0 divide-y lg:hidden">
            {visible.map((borrower, index) => (
              <motion.div key={borrower.key} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.02, 0.2) }}>
                <Item render={<button type="button" onClick={() => open(borrower)} />} className="w-full rounded-none px-4 text-left">
                  <ItemMedia>
                    <Avatar>
                      <AvatarFallback>{initials(borrower.details.name)}</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className={cn(borrower.overdueLoanCount > 0 && "text-red-text")}>{borrower.details.name}</ItemTitle>
                    <ItemDescription>{borrower.details.department || formatPhone(borrower.details.cellphone) || "—"}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ItemsOutBadge borrower={borrower} />
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </ItemActions>
                </Item>
              </motion.div>
            ))}
          </ItemGroup>
        </>
      )}
    </>
  )
}

function ItemsOutBadge({ borrower }: { borrower: Borrower }) {
  if (borrower.itemsOut === 0) return <Badge variant="outline" className="text-muted-foreground">Nothing out</Badge>
  return <Badge className={borrower.overdueLoanCount > 0 ? TONE_CLASSES.red : TONE_CLASSES.blue}>{borrower.itemsOut} out</Badge>
}
