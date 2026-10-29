import type { ReactNode } from "react"
import { CalendarClock, CircleAlert, CircleCheck, Clock, MoveRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/shared/lib/cn"
import { formatDate } from "@/shared/lib/dates"
import { TONE_CLASSES, type Tone } from "@/shared/lib/tones"
import type { Loan } from "../domain/loan"
import { STATUS_LABELS, type LoanStatus } from "../domain/status"

const TONES: Record<LoanStatus, Tone> = {
  "on-loan": "blue",
  "due-today": "amber",
  overdue: "red",
  returned: "grey",
}

const ICONS: Record<LoanStatus, ReactNode> = {
  "on-loan": <Clock data-icon="inline-start" />,
  "due-today": <CalendarClock data-icon="inline-start" />,
  overdue: <CircleAlert data-icon="inline-start" />,
  returned: <CircleCheck data-icon="inline-start" />,
}

/** A shadcn Badge in the pale tint for the loan's status. */
export function LoanStatusPill({ status, overdueDays = 0, size = "md" }: { status: LoanStatus; overdueDays?: number; size?: "sm" | "md" }) {
  const label = status === "overdue" && overdueDays > 0 ? `${overdueDays}d overdue` : STATUS_LABELS[status]
  return (
    <Badge className={cn(TONE_CLASSES[TONES[status]], size === "md" && "h-6 px-2.5")}>
      {ICONS[status]}
      {label}
    </Badge>
  )
}

/** Small marker shown next to the return date of an extended loan. */
export function ExtensionMark({ loan }: { loan: Loan }) {
  if (!loan.originalReturnDate || loan.originalReturnDate === loan.expectedReturnDate) return null
  const text = `Extended from ${formatDate(loan.originalReturnDate)}`
  return (
    <Badge className={TONE_CLASSES.purple} title={text} aria-label={text}>
      <MoveRight data-icon="inline-start" />
      Extended
    </Badge>
  )
}
