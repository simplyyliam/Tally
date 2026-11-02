import { CURRENT_SCHEMA_VERSION, prepareStoredDocument } from "./migrations"
import type { KeyValueStorage, RegisterDocument } from "./storage-types"

export { isRecord, type KeyValueStorage, type RegisterDocument } from "./storage-types"

/**
 * The whole register is one JSON document in browser storage, split into named
 * sections ("loans", "settings", …). Each feature's local repository owns one
 * section and validates it with its own schema; this store only reads, writes
 * and tells subscribers when something changed.
 *
 * On first read it upgrades older data (see migrations.ts), saves the result,
 * and keeps the original text under "<key>.before-v<N>" so nothing is lost.
 * Writes are synchronous and throw if the browser refuses them (storage full
 * or blocked), so a failed save is reported instead of silently lost.
 */

export const STORAGE_KEY = "tally.register"

export class StorageWriteError extends Error {}

export class LocalDocumentStore {
  private readonly storage: KeyValueStorage
  private readonly key: string
  private cache: RegisterDocument | null = null
  private readonly listeners = new Set<() => void>()
  private blockedReason: string | undefined
  private upgradedFrom: number | null = null

  constructor(storage: KeyValueStorage, options: { key?: string } = {}) {
    this.storage = storage
    this.key = options.key ?? STORAGE_KEY
  }

  read(): RegisterDocument {
    if (this.cache) return this.cache
    const text = this.storage.getItem(this.key)
    let raw: unknown = undefined
    if (text) {
      try {
        raw = JSON.parse(text)
      } catch {
        // Keep the unreadable text so it can be recovered by hand; never overwrite it.
        this.storage.setItem(`${this.key}.unreadable.${Date.now()}`, text)
      }
    }
    const prepared = prepareStoredDocument(raw, this.storage)
    this.cache = prepared.document
    this.blockedReason = prepared.readOnlyReason
    if (prepared.migratedFrom !== null) {
      this.upgradedFrom = prepared.migratedFrom
      if (text) this.storage.setItem(`${this.key}.before-v${CURRENT_SCHEMA_VERSION}`, text)
      this.persist(prepared.document)
    }
    return this.cache
  }

  /** The version older data was upgraded from during this session, if any. */
  get migratedFrom(): number | null {
    this.read()
    return this.upgradedFrom
  }

  /** Why changes can't be saved right now (e.g. data from a newer app version). */
  get readOnlyReason(): string | undefined {
    this.read()
    return this.blockedReason
  }

  getSection(name: string): unknown {
    return this.read()[name]
  }

  setSection(name: string, value: unknown): void {
    this.write({ ...this.read(), [name]: value })
  }

  /** Swaps in a complete document, e.g. when restoring a backup. Older backups are upgraded first. */
  replace(document: RegisterDocument): void {
    const prepared = prepareStoredDocument(document, this.storage)
    if (prepared.readOnlyReason) throw new StorageWriteError(prepared.readOnlyReason)
    this.write(prepared.document)
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Drops the cache and re-reads, e.g. after another browser tab saved. */
  reload(): void {
    this.cache = null
    this.notify()
  }

  private write(document: RegisterDocument): void {
    this.read()
    if (this.blockedReason) throw new StorageWriteError(this.blockedReason)
    this.persist({ ...document, schemaVersion: CURRENT_SCHEMA_VERSION })
    this.notify()
  }

  private persist(document: RegisterDocument): void {
    try {
      this.storage.setItem(this.key, JSON.stringify(document))
    } catch (error) {
      throw new StorageWriteError(
        "The browser refused to save. Storage may be full or blocked — download a backup now.",
        { cause: error },
      )
    }
    this.cache = document
  }

  private notify(): void {
    for (const listener of this.listeners) listener()
  }
}

/** In-memory storage for tests. */
export function createMemoryStorage(initial: Record<string, string> = {}): KeyValueStorage & { dump(): Record<string, string> } {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
    dump: () => Object.fromEntries(data),
  }
}
