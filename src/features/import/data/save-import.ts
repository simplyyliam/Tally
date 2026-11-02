import type { Loan, LoanRepository } from "@/features/loans"
import type { ImportedLoan } from "../domain/build-import"
import { finishImportedLoan } from "../domain/finish-imported-loan"

/**
 * Saves the planned loans as normal loans with fresh LN- references, then
 * back-dates their issue moment and marks returned ones as returned.
 */
export async function saveImport(repository: LoanRepository, loans: ReadonlyArray<ImportedLoan>, importedAt: string): Promise<Loan[]> {
  const created = await repository.createMany(loans.map((loan) => loan.draft))
  const finished = created.map((loan, index) => finishImportedLoan(loan, loans[index].returnedOn, importedAt))
  await repository.saveMany(finished)
  return finished
}
