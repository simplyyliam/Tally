import { Badge } from "@/components/ui/badge"
import { cn } from "@/shared/lib/cn"
import type { Loan } from "../domain/loan"
import { isPartlyReturned, outstandingQuantity, remainingQuantity, totalQuantity, type LoanStatus } from "../domain/status"

/**
 * The borrower's name as the register shows it: red while overdue, struck
 * through once everything is back (that's how the paper register worked).
 */
export function BorrowerName({ loan, status, className }: { loan: Loan; status: LoanStatus; className?: string }) {
  return (
    <p
      className={cn(
        "truncate font-medium",
        status === "overdue" && "text-red-text",
        status === "returned" && "text-muted-foreground line-through decoration-faint",
        className,
      )}
    >
      {loan.borrower.name}
    </p>
  )
}

/** "2 × Extension cord" plus an outlined "+2" badge when there are more lines. */
export function ItemsSummary({ loan }: { loan: Loan }) {
  const [first, ...rest] = loan.lines
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className={cn("truncate", remainingQuantity(first) === 0 && rest.length > 0 && "text-muted-foreground line-through")}>
        <span className="text-muted-foreground tabular">{first.quantity} ×</span> {first.description}
      </span>
      {isPartlyReturned(loan) && (
        <Badge variant="secondary" className="text-muted-foreground" title="Some items are back">
          {outstandingQuantity(loan)} of {totalQuantity(loan)} out
        </Badge>
      )}
      {rest.length > 0 && (
        <Badge variant="outline" className="text-muted-foreground" title={rest.map((line) => `${line.quantity} × ${line.description}`).join(", ")}>
          +{rest.length}
        </Badge>
      )}
    </div>
  )
}
