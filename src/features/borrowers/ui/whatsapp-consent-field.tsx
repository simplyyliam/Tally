import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

interface WhatsappConsentFieldProps {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

/**
 * "OK to contact on WhatsApp", asked where the number is captured. POPIA
 * expects people to know why their number is kept and to be able to say no.
 */
export function WhatsappConsentField({ id, checked, onCheckedChange, className }: WhatsappConsentFieldProps) {
  return (
    <Field orientation="horizontal" className={className}>
      <FieldContent>
        <FieldLabel htmlFor={id}>OK to contact on WhatsApp</FieldLabel>
        <FieldDescription>POPIA: their number is only used for loan reminders. Turn off if they'd rather not be messaged.</FieldDescription>
      </FieldContent>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </Field>
  )
}
