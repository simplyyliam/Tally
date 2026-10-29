import type { ReactElement, ReactNode } from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "@/shared/lib/cn"

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

/** The dark dropdown from the table reference ("Call / Email / View in Scheduler"). */
export function Menu({ trigger, actions, align = "end" }: MenuProps) {
  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger render={trigger} />
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner sideOffset={6} align={align} className="z-50">
          <MenuPrimitive.Popup
            className={cn(
              "min-w-48 origin-[var(--transform-origin)] rounded-xl bg-ink p-1.5 text-[13px] text-white shadow-float outline-none",
              "transition-[opacity,scale] duration-150 ease-out data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            )}
          >
            {actions.map((action, index) =>
              action === "separator" ? (
                <MenuPrimitive.Separator key={`separator-${index}`} className="mx-2 my-1 h-px bg-white/10" />
              ) : (
                <MenuPrimitive.Item
                  key={action.label}
                  disabled={action.disabled}
                  onClick={action.onSelect}
                  className={cn(
                    "flex h-9 cursor-default items-center gap-2.5 rounded-lg px-2.5 outline-none select-none [&_svg]:size-4 [&_svg]:opacity-80",
                    "data-[highlighted]:bg-white/12 data-[disabled]:opacity-40",
                    action.tone === "danger" && "text-[oklch(0.8_0.12_25)]",
                  )}
                >
                  {action.icon}
                  {action.label}
                </MenuPrimitive.Item>
              ),
            )}
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}
