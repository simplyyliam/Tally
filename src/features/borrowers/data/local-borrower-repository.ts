import { nowTimestamp } from "@/shared/lib/dates"
import type { LocalDocumentStore } from "@/shared/schema/local-document"
import { borrowerPreferenceSchema, type BorrowerPreference } from "../domain/borrower"
import type { BorrowerRepository } from "./borrower-repository"

const SECTION = "borrowerPreferences"

export class LocalBorrowerRepository implements BorrowerRepository {
  private readonly store: LocalDocumentStore

  constructor(store: LocalDocumentStore) {
    this.store = store
  }

  async listPreferences(): Promise<BorrowerPreference[]> {
    return this.readAll()
  }

  async setWhatsappConsent(key: string, consent: boolean): Promise<void> {
    const next = this.readAll().filter((preference) => preference.key !== key)
    next.push({ key, whatsappConsent: consent, updatedAt: nowTimestamp() })
    this.store.setSection(SECTION, next)
  }

  async removePreferences(keys: ReadonlyArray<string>): Promise<void> {
    const removing = new Set(keys)
    this.store.setSection(
      SECTION,
      this.readAll().filter((preference) => !removing.has(preference.key)),
    )
  }

  subscribe(onChange: () => void): () => void {
    return this.store.subscribe(onChange)
  }

  private readAll(): BorrowerPreference[] {
    const raw = this.store.getSection(SECTION)
    if (!Array.isArray(raw)) return []
    // A damaged preference is dropped back to the default (consent on), never blocking the app.
    return raw.flatMap((record) => {
      const result = borrowerPreferenceSchema.safeParse(record)
      return result.success ? [result.data] : []
    })
  }
}
