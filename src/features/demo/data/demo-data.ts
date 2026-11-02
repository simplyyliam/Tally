import { orphanedPreferenceKeys, type BorrowerRepository } from "@/features/borrowers"
import type { ActivityRepository, LoanRepository } from "@/features/loans"
import { createId } from "@/shared/lib/ids"
import type { IsoDate } from "@/shared/lib/dates"
import { buildDemoLoans } from "../domain/demo-loans"

export async function loadDemoData(loans: LoanRepository, today: IsoDate, at: string): Promise<number> {
  const demo = buildDemoLoans(today, at, createId)
  await loans.saveMany(demo)
  return demo.length
}

/** Removes every demo loan, plus its activity and any borrower preference left without a loan. Real loans are untouched. */
export async function clearDemoData(repositories: { loans: LoanRepository; activity: ActivityRepository; borrowers: BorrowerRepository }): Promise<number> {
  const all = await repositories.loans.list()
  const demoIds = all.filter((loan) => loan.isDemo).map((loan) => loan.id)
  await repositories.loans.remove(demoIds)
  await repositories.activity.removeForLoans(demoIds)
  const remaining = all.filter((loan) => !loan.isDemo)
  await repositories.borrowers.removePreferences(orphanedPreferenceKeys(await repositories.borrowers.listPreferences(), remaining))
  return demoIds.length
}
