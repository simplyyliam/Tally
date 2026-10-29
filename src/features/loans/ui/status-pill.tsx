import { CalendarClock, CircleCheck, CircleAlert, Clock, MoveRight } from "lucide-react"
import { Pill, type PillTone } from "@/shared/ui/pill"
import { formatDate } from "@/shared/lib/dates"
import { STATUS_LABELS, type LoanStatus } from "../domain/status"
import type { Loan } from "../domain/loan"

const TONES: Record<LoanStatus, PillTone> = {
  "on-loan": "blue",
  "due-today": "amber",
  overdue: "red",
  returned: "grey",
}

const ICONS: Record<LoanStatus, React.ReactNode> = {
  "on-loan": <Clock />,
  "due-today": <CalendarClock />,
  overdue: <CircleAlert />,
  returned: <CircleCheck />,
}

export function LoanStatusPill({ status, overdueDays = 0, size }: { status: LoanStatus; overdueDays?: number; size?: "sm" | "md" }) {
  const label = status === "overdue" && overdueDays > 0 ? `${overdueDays}d overdue` : STATUS_LABELS[status]
  return (
    <Pill tone={TONES[status]} icon={ICONS[status]} size={size}>
      {label}
    </Pill>
  )
}

/** Small marker shown next to the return date of an extended loan. */
export function ExtensionMark({ loan }: { loan: Loan }) {
  if (!loan.originalReturnDate || loan.originalReturnDate === loan.expectedReturnDate) return null
  return (
    <Pill
      tone="purple"
      size="sm"
      icon={<MoveRight />}
      title={`Extended from ${formatDate(loan.originalReturnDate)}`}
      aria-label={`Extended from ${formatDate(loan.originalReturnDate)}`}
    >
      Extended
    </Pill>
  )
}
