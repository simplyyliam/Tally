import { MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/shared/lib/cn"
import { useReminderChannel } from "../data/reminder-channel-context"

interface WhatsAppButtonProps {
  phone: string
  text: string
  /** Set when the borrower opted out, so the button explains itself instead of sending. */
  blockedReason?: string
  size?: "sm" | "default" | "lg" | "icon-sm" | "icon-lg"
  label?: string
  className?: string
  onSent?: () => void
}

/** Opens WhatsApp with the reminder typed in. Icon-only versions explain themselves in a tooltip. */
export function WhatsAppButton({ phone, text, blockedReason, size = "sm", label = "WhatsApp", className, onSent }: WhatsAppButtonProps) {
  const channel = useReminderChannel()
  const reason = blockedReason ?? channel.unavailableReason({ phone, text })
  const iconOnly = size === "icon-sm" || size === "icon-lg"

  const button = (
    <Button
      variant="outline"
      size={size}
      disabled={reason !== null}
      aria-label={iconOnly ? `${label}${reason ? ` — ${reason}` : ""}` : undefined}
      className={cn(!reason && "text-green-text hover:text-green-text", className)}
      onClick={async (event) => {
        event.stopPropagation()
        const result = await channel.send({ phone, text })
        if (result.ok) onSent?.()
        else toast.error(result.reason)
      }}
    >
      <MessageCircle data-icon={iconOnly ? undefined : "inline-start"} />
      {!iconOnly && label}
    </Button>
  )
  if (!iconOnly) return button
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>{button}</TooltipTrigger>
      <TooltipContent>{reason ?? "Send a WhatsApp reminder"}</TooltipContent>
    </Tooltip>
  )
}
