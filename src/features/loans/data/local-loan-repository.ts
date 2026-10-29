import { createId } from "@/shared/lib/ids"
import { nowTimestamp } from "@/shared/lib/dates"
import type { LocalDocumentStore } from "@/shared/schema/local-document"
import { createLoan } from "../domain/changes"
import { loanDraftSchema, loanSchema, type Loan, type LoanDraft } from "../domain/loan"
import type { LoanRepository } from "./loan-repository"

const SECTION = "loans"
const QUARANTINE = "quarantine"

/**
 * Loans kept in the browser via the shared document store.
 *
 * A stored record that fails validation is never deleted: it is moved to the
 * "quarantine" section (which is included in backups) so nothing is lost and
 * the rest of the register keeps working.
 */
export class LocalLoanRepository implements LoanRepository {
  private readonly store: LocalDocumentStore
  private readonly clock: () => string

  constructor(store: LocalDocumentStore, clock: () => string = () => nowTimestamp()) {
    this.store = store
    this.clock = clock
  }

  async list(): Promise<Loan[]> {
    return this.readAll()
  }

  async get(id: string): Promise<Loan | undefined> {
    return this.readAll().find((loan) => loan.id === id)
  }

  async create(draft: LoanDraft): Promise<Loan> {
    const [loan] = await this.createMany([draft])
    return loan
  }

  async createMany(drafts: ReadonlyArray<LoanDraft>): Promise<Loan[]> {
    const at = this.clock()
    const created = drafts.map((draft) => createLoan(loanDraftSchema.parse(draft), { at, createId }))
    this.writeAll([...this.readAll(), ...created])
    return created
  }

  async save(loan: Loan): Promise<void> {
    await this.saveMany([loan])
  }

  async saveMany(loans: ReadonlyArray<Loan>): Promise<void> {
    const updates = new Map(loans.map((loan) => [loan.id, loanSchema.parse(loan)]))
    const next = this.readAll().map((loan) => updates.get(loan.id) ?? loan)
    const existingIds = new Set(next.map((loan) => loan.id))
    for (const loan of updates.values()) {
      if (!existingIds.has(loan.id)) next.push(loan)
    }
    this.writeAll(next)
  }

  async remove(ids: ReadonlyArray<string>): Promise<void> {
    const removing = new Set(ids)
    this.writeAll(this.readAll().filter((loan) => !removing.has(loan.id)))
  }

  subscribe(onChange: () => void): () => void {
    return this.store.subscribe(onChange)
  }

  private readAll(): Loan[] {
    const raw = this.store.getSection(SECTION)
    if (!Array.isArray(raw)) return []
    const valid: Loan[] = []
    const invalid: unknown[] = []
    for (const record of raw) {
      const result = loanSchema.safeParse(record)
      if (result.success) valid.push(result.data)
      else invalid.push({ section: SECTION, record, reason: result.error.issues[0]?.message ?? "Invalid", at: this.clock() })
    }
    if (invalid.length > 0) {
      const quarantine = this.store.getSection(QUARANTINE)
      this.store.replace({
        ...this.store.read(),
        [SECTION]: valid,
        [QUARANTINE]: [...(Array.isArray(quarantine) ? quarantine : []), ...invalid],
      })
    }
    return valid
  }

  private writeAll(loans: Loan[]): void {
    this.store.setSection(SECTION, loans)
  }
}
