import type { ReactElement, ReactNode } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export interface MenuAction {
  label: string
  icon?: ReactNode
  onSelect: () => void
  tone?: "default" | "danger"
  disabled?: boolean
}

interface MenuProps {
  /** The element that opens the menu, e.g. an icon button. */
  trigger: ReactElement
  actions: ReadonlyArray<MenuAction | "separator">
  align?: "start" | "end"
}

/**
 * The shadcn DropdownMenu, dressed as the dark menu from the table reference
 * ("Call / Email / View in Scheduler") via className.
 */
export function Menu({ trigger, actions, align = "end" }: MenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align={align} className="min-w-48 rounded-xl bg-ink p-1.5 text-white ring-0 shadow-float">
        {actions.map((action, index) =>
          action === "separator" ? (
            <DropdownMenuSeparator key={`separator-${index}`} className="mx-2 my-1 bg-white/10" />
          ) : (
            <DropdownMenuItem
              key={action.label}
              disabled={action.disabled}
              variant={action.tone === "danger" ? "destructive" : "default"}
              onClick={action.onSelect}
              className="h-9 rounded-lg text-[13px] font-normal text-white focus:bg-white/12 focus:text-white not-data-[variant=destructive]:focus:**:text-white data-[variant=destructive]:text-[oklch(0.8_0.12_25)] data-[variant=destructive]:focus:bg-white/12 data-[variant=destructive]:focus:text-[oklch(0.8_0.12_25)] data-[variant=destructive]:*:[svg]:text-[oklch(0.8_0.12_25)] [&_svg]:opacity-80"
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
