import { z } from "zod"
import { formatDate } from "@/shared/lib/dates"
import { plural } from "@/shared/lib/text"
import type { Loan } from "./loan"
import { outstandingQuantity } from "./status"

/**
 * The local activity log: who did what to which loan, and when. Entries copy
 * the reference and borrower name so a deleted loan's history still reads
 * properly. Entries are only added, never edited; data retention removes
 * them together with the loans they belong to.
 */

export const ACTIVITY_KINDS = ["create", "edit", "extend", "return", "partial-return", "delete", "undo"] as const

export type ActivityKind = (typeof ACTIVITY_KINDS)[number]

export const activityEntrySchema = z.object({
  id: z.string().min(1),
  at: z.string(),
  kind: z.enum(ACTIVITY_KINDS),
  loanId: z.string().min(1),
  reference: z.string(),
  borrowerName: z.string(),
  /** The staff name set in Settings on the device that made the change. */
  staffName: z.string().default(""),
  /** One readable line, e.g. "Return date moved to 12 Nov 2026". */
  detail: z.string().default(""),
})

export type ActivityEntry = z.infer<typeof activityEntrySchema>

/** What callers supply; the repository adds id and timestamp. */
export type ActivityDraft = Omit<ActivityEntry, "id" | "at">

export const ACTIVITY_LABELS: Record<ActivityKind, string> = {
  create: "Issued",
  edit: "Edited",
  extend: "Extended",
  return: "Returned",
  "partial-return": "Partly returned",
  delete: "Deleted",
  undo: "Undone",
}

export function activityFor(loan: Loan, kind: ActivityKind, staffName: string, detail: string): ActivityDraft {
  return { kind, loanId: loan.id, reference: loan.reference, borrowerName: loan.borrower.name, staffName, detail }
}

/** "3 items: 2 × Drill, 1 × Ladder" */
export function describeIssue(loan: Loan): string {
  const total = loan.lines.reduce((sum, line) => sum + line.quantity, 0)
  return `${plural(total, "item")}: ${loan.lines.map((line) => `${line.quantity} × ${line.description}`).join(", ")}`
}

export function describeExtension(loan: Loan): string {
  return `Return date moved to ${formatDate(loan.expectedReturnDate)}`
}

/** Compares the loan before and after a return to say what came back and what's left. */
export function describeReturn(before: Loan, after: Loan): { kind: "return" | "partial-return"; detail: string } {
  const back = after.lines
    .map((line) => {
      const previous = before.lines.find((candidate) => candidate.id === line.id)
      return { description: line.description, count: line.quantityReturned - (previous?.quantityReturned ?? 0) }
    })
    .filter((change) => change.count > 0)
    .map((change) => `${change.count} × ${change.description}`)
    .join(", ")
  const left = outstandingQuantity(after)
  if (left === 0) return { kind: "return", detail: back ? `Everything back: ${back}` : "Everything back" }
  return { kind: "partial-return", detail: `${back} back · ${plural(left, "item")} still out` }
}

/** Newest first, optionally only one loan's entries. */
export function sortActivity(entries: ReadonlyArray<ActivityEntry>, loanId?: string): ActivityEntry[] {
  return entries.filter((entry) => !loanId || entry.loanId === loanId).sort((a, b) => b.at.localeCompare(a.at))
}
