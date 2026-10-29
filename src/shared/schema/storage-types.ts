/** The browser storage API we rely on (localStorage, or an in-memory stand-in in tests). */
export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/** The whole register: named sections such as "loans" and "settings". */
export type RegisterDocument = Record<string, unknown>

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
