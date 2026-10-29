import { useState } from "react"
import { CalendarDays } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/shared/lib/cn"
import { formatDate, isIsoDate, type IsoDate } from "@/shared/lib/dates"

interface DatePickerProps {
  id: string
  value: IsoDate
  onChange: (value: IsoDate) => void
  /** Earliest date that can be picked. */
  min?: IsoDate
  invalid?: boolean
  describedBy?: string
  className?: string
}

/** Calendar days use local midnight so the picked day never shifts with time zones. */
function toDate(value: IsoDate): Date | undefined {
  if (!isIsoDate(value)) return undefined
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toIso(date: Date): IsoDate {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** A date field: the shadcn Calendar in a shadcn Popover, opened from a button showing the date. */
export function DatePicker({ id, value, onChange, min, invalid, describedBy, className }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = toDate(value)
  const minDate = min ? toDate(min) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              "h-10 w-full justify-start rounded-lg border-border-strong bg-background px-3 font-normal shadow-card md:h-9",
              !selected && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarDays className="text-muted-foreground" />
        {selected ? formatDate(value) : "Pick a date"}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-xl p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          disabled={minDate ? { before: minDate } : undefined}
          weekStartsOn={1}
          onSelect={(date) => {
            if (!date) return
            onChange(toIso(date))
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
