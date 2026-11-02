import { addMonths, dateOfTimestamp, type IsoDate } from "@/shared/lib/dates"
import type { Loan } from "./loan"
import { isFullyReturned } from "./status"

/**
 * Data retention (POPIA: keep personal details only as long as needed).
 * Only loans that are completely back are ever purged; anything with an item
 * still out stays, however old, because it is still someone's responsibility.
 */

/** The first day that is kept: returned before this date means "older than N months". */
export function retentionCutoff(months: number, today: IsoDate): IsoDate {
  return addMonths(today, -months)
}

/** Returned loans whose last item came back before the cutoff. */
export function loansToPurge(loans: ReadonlyArray<Loan>, months: number, today: IsoDate): Loan[] {
  if (!Number.isInteger(months) || months < 1) return []
  const cutoff = retentionCutoff(months, today)
  return loans.filter((loan) => isFullyReturned(loan) && dateOfTimestamp(loan.returnedAt ?? loan.updatedAt) < cutoff)
}
