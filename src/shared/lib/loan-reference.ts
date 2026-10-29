/**
 * Loan references look like LN-2026-0001: the year the loan was issued and a
 * number that counts up within that year. Numbers are never reused, even
 * after a loan is deleted, so a reference written on paper always means one loan.
 *
 * This lives in shared/lib because both the loans feature and the storage
 * migration (which numbers pre-v1.0 loans) need it.
 */

const PATTERN = /^LN-(\d{4})-(\d{4,})$/

export function formatLoanReference(year: number, sequence: number): string {
  return `LN-${year}-${String(sequence).padStart(4, "0")}`
}

export function parseLoanReference(reference: string): { year: number; sequence: number } | null {
  const match = PATTERN.exec(reference)
  return match ? { year: Number(match[1]), sequence: Number(match[2]) } : null
}

export function isLoanReference(reference: string): boolean {
  return PATTERN.test(reference)
}

/** Per-year "last number used", kept in storage so deleted numbers stay retired. */
export type ReferenceCounters = Record<string, number>

/** The highest number used in `year`, looking at both the counter and existing references. */
export function lastSequenceFor(year: number, references: ReadonlyArray<string>, counters: ReferenceCounters): number {
  let highest = counters[String(year)] ?? 0
  for (const reference of references) {
    const parsed = parseLoanReference(reference)
    if (parsed && parsed.year === year && parsed.sequence > highest) highest = parsed.sequence
  }
  return highest
}

/**
 * Hands out the next `count` references for `year` and returns the updated
 * counters to save alongside them.
 */
export function allocateReferences(
  year: number,
  count: number,
  references: ReadonlyArray<string>,
  counters: ReferenceCounters,
): { references: string[]; counters: ReferenceCounters } {
  const start = lastSequenceFor(year, references, counters)
  const allocated = Array.from({ length: count }, (_, index) => formatLoanReference(year, start + index + 1))
  return { references: allocated, counters: { ...counters, [String(year)]: start + count } }
}
