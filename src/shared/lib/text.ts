/** "1 item", "3 items" */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

/** Lower-case, trimmed and single-spaced, for comparing names typed by different people. */
export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

/** "Thandi Nkosi" -> "TN" */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0][0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}
