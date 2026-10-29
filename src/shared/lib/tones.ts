/**
 * Tailwind classes for the pale-tint status colours from docs/design, applied
 * to shadcn Badges and Alerts via className. Strings only, not a component.
 */
export const TONE_CLASSES = {
  green: "border-transparent bg-green-tint text-green-text",
  amber: "border-transparent bg-amber-tint text-amber-text",
  red: "border-transparent bg-red-tint text-red-text",
  blue: "border-transparent bg-blue-tint text-blue-text",
  purple: "border-transparent bg-purple-tint text-purple-text",
  grey: "border-transparent bg-grey-tint text-grey-text",
} as const

export type Tone = keyof typeof TONE_CLASSES
