/**
 * The whole register is one JSON document in browser storage, split into named
 * sections ("loans", "settings", …). Each feature's local repository owns one
 * section and validates it with its own schema; this store only reads, writes
 * and tells subscribers when something changed.
 *
 * Writes are synchronous and throw if the browser refuses them (storage full or
 * blocked), so a failed save is reported instead of silently lost.
 */

export const STORAGE_KEY = "tally.register"

export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type RegisterDocument = Record<string, unknown>

export class StorageWriteError extends Error {}

export class LocalDocumentStore {
  private readonly storage: KeyValueStorage
  private readonly key: string
  private cache: RegisterDocument | null = null
  private readonly listeners = new Set<() => void>()
  private readonly prepare: (raw: unknown) => RegisterDocument

  /**
   * @param prepare turns whatever is stored (possibly an older version) into
   *   the current document shape. Defaults to "use as-is".
   */
  constructor(
    storage: KeyValueStorage,
    options: { key?: string; prepare?: (raw: unknown) => RegisterDocument } = {},
  ) {
    this.storage = storage
    this.key = options.key ?? STORAGE_KEY
    this.prepare = options.prepare ?? ((raw) => (isRecord(raw) ? raw : {}))
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
    this.cache = this.prepare(raw)
    return this.cache
  }

  getSection(name: string): unknown {
    return this.read()[name]
  }

  setSection(name: string, value: unknown): void {
    this.write({ ...this.read(), [name]: value })
  }

  /** Swaps in a complete document, e.g. when restoring a backup. */
  replace(document: RegisterDocument): void {
    this.write(document)
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
    try {
      this.storage.setItem(this.key, JSON.stringify(document))
    } catch (error) {
      throw new StorageWriteError(
        "The browser refused to save. Storage may be full or blocked — download a backup now.",
        { cause: error },
      )
    }
    this.cache = document
    this.notify()
  }

  private notify(): void {
    for (const listener of this.listeners) listener()
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
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
