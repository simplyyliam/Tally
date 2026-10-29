import { MessageCircle } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/cn"
import { useToast } from "@/shared/ui/toast"
import { useReminderChannel } from "../data/reminder-channel-context"

interface WhatsAppButtonProps {
  phone: string
  text: string
  /** Set when the borrower opted out, so the button explains itself instead of sending. */
  blockedReason?: string
  size?: "sm" | "md" | "lg" | "icon-sm"
  variant?: "outline" | "success" | "secondary"
  label?: string
  className?: string
  onSent?: () => void
}

export function WhatsAppButton({
  phone,
  text,
  blockedReason,
  size = "sm",
  variant = "outline",
  label = "WhatsApp",
  className,
  onSent,
}: WhatsAppButtonProps) {
  const channel = useReminderChannel()
  const toast = useToast()
  const reason = blockedReason ?? channel.unavailableReason({ phone, text })
  const iconOnly = size === "icon-sm"

  return (
    <Button
      variant={variant}
      size={size}
      disabled={reason !== null}
      title={reason ?? `Open ${channel.label} with the reminder ready to send`}
      aria-label={iconOnly ? `${label}${reason ? ` — ${reason}` : ""}` : undefined}
      className={cn(!reason && variant === "outline" && "text-green-text", className)}
      onClick={async (event) => {
        event.stopPropagation()
        const result = await channel.send({ phone, text })
        if (result.ok) onSent?.()
        else toast(result.reason, { tone: "error" })
      }}
    >
      <MessageCircle />
      {!iconOnly && label}
    </Button>
  )
}
