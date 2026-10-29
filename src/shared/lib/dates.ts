/**
 * The one place that knows about dates.
 *
 * Calendar dates (loan start, expected return) are stored as plain "YYYY-MM-DD"
 * strings so they never shift with the device's time zone. "Today" is always
 * worked out in Africa/Johannesburg, because that is where the register is used:
 * a phone set to UTC must still agree with the office about what is overdue.
 */

export const TIME_ZONE = "Africa/Johannesburg"

/** A calendar date in the form YYYY-MM-DD. */
export type IsoDate = string

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 24 * 60 * 60 * 1000

const calendarFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
}

/** Today's calendar date in Johannesburg. */
export function todayIso(now: Date = new Date()): IsoDate {
  return calendarFormatter.format(now)
}

/** The current moment as an ISO timestamp, used for createdAt/returnedAt etc. */
export function nowTimestamp(now: Date = new Date()): string {
  return now.toISOString()
}

/** The Johannesburg calendar date a timestamp falls on. */
export function dateOfTimestamp(timestamp: string): IsoDate {
  return calendarFormatter.format(new Date(timestamp))
}

export function yearOfTimestamp(timestamp: string): number {
  return Number(dateOfTimestamp(timestamp).slice(0, 4))
}

function toUtcMs(date: IsoDate): number {
  return Date.parse(`${date}T00:00:00Z`)
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return new Date(toUtcMs(date) + days * DAY_MS).toISOString().slice(0, 10)
}

export function addMonths(date: IsoDate, months: number): IsoDate {
  const [year, month, day] = date.split("-").map(Number)
  const target = new Date(Date.UTC(year, month - 1 + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(day, lastDay))
  return target.toISOString().slice(0, 10)
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / DAY_MS)
}

const displayDate = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

const displayDateTime = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
})

/** "29 Oct 2026" */
export function formatDate(date: IsoDate): string {
  if (!isIsoDate(date)) return date
  return displayDate.format(new Date(`${date}T00:00:00Z`))
}

/** "29 Oct 2026, 14:05" in Johannesburg time. */
export function formatDateTime(timestamp: string): string {
  const parsed = new Date(timestamp)
  if (Number.isNaN(parsed.getTime())) return timestamp
  return displayDateTime.format(parsed)
}

/** "today", "tomorrow", "in 3 days", "2 days ago" relative to `today`. */
export function formatRelativeDay(date: IsoDate, today: IsoDate): string {
  const diff = daysBetween(today, date)
  if (diff === 0) return "today"
  if (diff === 1) return "tomorrow"
  if (diff === -1) return "yesterday"
  return diff > 0 ? `in ${diff} days` : `${-diff} days ago`
}

/** A file-name friendly stamp such as 2026-10-29. */
export function fileDateStamp(now: Date = new Date()): string {
  return todayIso(now)
}
