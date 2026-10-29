import { isRecord, type KeyValueStorage, type RegisterDocument } from "./storage-types"
import { legacyRecordToLoan } from "./legacy-loan"

/**
 * Storage versions. Every change to the stored shape bumps this number and
 * adds a step below, so data saved by any older version still loads.
 *
 *   0  pre-v1.0: a flat list of single-item loans under an older key, or a
 *      register document without a schemaVersion.
 *   1  v1.0: one "tally.register" document with sections and line items.
 */
export const CURRENT_SCHEMA_VERSION = 1

/** Keys an older (pre-v1.0) version of the register may have used. */
export const LEGACY_KEYS = ["tally-loans", "tally.loans", "loanRegister", "loans"] as const

export interface PreparedDocument {
  document: RegisterDocument
  /** The version the data was upgraded from, or null if nothing changed. */
  migratedFrom: number | null
  /** Set when the data must not be written back (e.g. saved by a newer version). */
  readOnlyReason?: string
}

type Step = (document: RegisterDocument) => RegisterDocument

/** STEPS[n] upgrades a version-n document to version n+1. */
const STEPS: Record<number, Step> = {
  0: (document) => ({
    ...document,
    loans: Array.isArray(document.loans) ? document.loans.map(upgradeLoanToV1) : [],
    schemaVersion: 1,
  }),
}

/**
 * Turns whatever is stored into a current-version document, without ever
 * dropping a record. Unknown fields are kept; they are simply ignored.
 */
export function prepareStoredDocument(raw: unknown, storage: KeyValueStorage): PreparedDocument {
  let document: RegisterDocument
  let version: number

  if (raw === undefined) {
    const legacy = readLegacyLoans(storage)
    if (!legacy) return { document: { schemaVersion: CURRENT_SCHEMA_VERSION }, migratedFrom: null }
    document = { loans: legacy }
    version = 0
  } else if (!isRecord(raw)) {
    // A bare array is the oldest possible shape: just the loans.
    document = { loans: Array.isArray(raw) ? raw : [] }
    version = 0
  } else {
    document = raw
    version = typeof raw.schemaVersion === "number" ? raw.schemaVersion : 0
  }

  if (version > CURRENT_SCHEMA_VERSION) {
    return {
      document,
      migratedFrom: null,
      readOnlyReason: "This register was saved by a newer version of Tally. Update the app before making changes.",
    }
  }

  const from = version
  while (version < CURRENT_SCHEMA_VERSION) {
    document = STEPS[version](document)
    version++
  }
  return { document, migratedFrom: from === CURRENT_SCHEMA_VERSION ? null : from }
}

function readLegacyLoans(storage: KeyValueStorage): unknown[] | null {
  for (const key of LEGACY_KEYS) {
    const text = storage.getItem(key)
    if (!text) continue
    try {
      const parsed: unknown = JSON.parse(text)
      if (Array.isArray(parsed)) return parsed
      if (isRecord(parsed) && Array.isArray(parsed.loans)) return parsed.loans
    } catch {
      // Not ours or unreadable: leave it exactly where it is.
    }
  }
  return null
}

/** Loans already in the v1 shape pass through; flat legacy rows are converted. */
function upgradeLoanToV1(record: unknown): unknown {
  if (isRecord(record) && Array.isArray(record.lines) && isRecord(record.borrower)) return record
  return legacyRecordToLoan(record)
}
