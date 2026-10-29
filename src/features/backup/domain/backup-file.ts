import { z } from "zod"
import { daysBetween, dateOfTimestamp, type IsoDate } from "@/shared/lib/dates"
import { deriveBorrowers } from "@/features/borrowers"
import { loanSchema, type Loan } from "@/features/loans"

/**
 * The backup file: a small envelope around the whole register document, so a
 * restore can check it really is a Tally backup before touching anything.
 */

export const BACKUP_FORMAT = 1

export const backupEnvelopeSchema = z.object({
  app: z.literal("tally"),
  kind: z.literal("backup"),
  format: z.number().int().positive(),
  exportedAt: z.string(),
  data: z.record(z.string(), z.unknown()),
})

export type BackupEnvelope = z.infer<typeof backupEnvelopeSchema>

export function buildBackup(document: Record<string, unknown>, exportedAt: string): BackupEnvelope {
  return { app: "tally", kind: "backup", format: BACKUP_FORMAT, exportedAt, data: document }
}

export function backupFileName(exportedAt: string): string {
  return `tally-backup-${dateOfTimestamp(exportedAt)}.json`
}

export class BackupFileError extends Error {}

/** Reads a file's text as a backup envelope, with a plain-language error if it isn't one. */
export function readBackupEnvelope(text: string): BackupEnvelope {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new BackupFileError("This file isn't a Tally backup (it isn't valid JSON).")
  }
  const result = backupEnvelopeSchema.safeParse(raw)
  if (!result.success) throw new BackupFileError("This file isn't a Tally backup.")
  if (result.data.format > BACKUP_FORMAT) {
    throw new BackupFileError("This backup was made by a newer version of Tally. Update the app first.")
  }
  return result.data
}

export interface BackupSummary {
  exportedAt: string
  loanCount: number
  borrowerCount: number
  openLoanCount: number
  /** Records that failed validation; they are kept, but listed so nobody is surprised. */
  unreadableCount: number
}

/** What the restore dialog shows before asking for confirmation. Expects an already-upgraded document. */
export function summariseBackup(document: Record<string, unknown>, exportedAt: string, today: IsoDate): BackupSummary {
  const raw = Array.isArray(document.loans) ? document.loans : []
  const loans: Loan[] = []
  let unreadableCount = 0
  for (const record of raw) {
    const result = loanSchema.safeParse(record)
    if (result.success) loans.push(result.data)
    else unreadableCount++
  }
  return {
    exportedAt,
    loanCount: loans.length,
    borrowerCount: deriveBorrowers(loans, today).length,
    openLoanCount: loans.filter((loan) => !loan.returnedAt).length,
    unreadableCount,
  }
}

/**
 * Whether to show the "make a backup" nudge: there is real (non-demo) data and
 * no backup in the last `days` days.
 */
export function isBackupDue(lastBackupAt: string | undefined, hasRealData: boolean, today: IsoDate, days = 7): boolean {
  if (!hasRealData) return false
  if (!lastBackupAt) return true
  return daysBetween(dateOfTimestamp(lastBackupAt), today) >= days
}
