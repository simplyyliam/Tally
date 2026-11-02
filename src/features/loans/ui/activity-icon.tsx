import { CalendarPlus, CircleCheck, FilePlus2, PackageMinus, Pencil, Trash2, Undo2 } from "lucide-react"
import type { ActivityKind } from "../domain/activity"

const ICONS = {
  create: FilePlus2,
  edit: Pencil,
  extend: CalendarPlus,
  return: CircleCheck,
  "partial-return": PackageMinus,
  delete: Trash2,
  undo: Undo2,
} satisfies Record<ActivityKind, unknown>

/** The small icon for an activity-log entry, the same on the loan and on the Activity page. */
export function ActivityIcon({ kind, className }: { kind: ActivityKind; className?: string }) {
  const Icon = ICONS[kind]
  return <Icon className={className} />
}
