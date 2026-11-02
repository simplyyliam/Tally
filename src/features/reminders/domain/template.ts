/**
 * Reminder text with placeholders. Unknown placeholders are left as typed so
 * a typo is visible in the preview instead of silently vanishing.
 */

export const TEMPLATE_PLACEHOLDERS = ["name", "items", "dueDate", "daysOverdue", "reference"] as const

export type TemplatePlaceholder = (typeof TEMPLATE_PLACEHOLDERS)[number]

export type TemplateValues = Record<TemplatePlaceholder, string>

export const DEFAULT_REMINDER_TEMPLATE = [
  "Hi {name}, a friendly reminder about loan {reference}.",
  "",
  "Items:",
  "{items}",
  "",
  "Return date: {dueDate}.",
  "Thank you!",
].join("\n")

export function renderTemplate(template: string, values: TemplateValues): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    (TEMPLATE_PLACEHOLDERS as ReadonlyArray<string>).includes(key) ? values[key as TemplatePlaceholder] : match,
  )
}

/** Placeholders in the template that aren't supported, e.g. "{nmae}". */
export function unknownPlaceholders(template: string): string[] {
  const found = [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1])
  return [...new Set(found.filter((key) => !(TEMPLATE_PLACEHOLDERS as ReadonlyArray<string>).includes(key)))]
}
