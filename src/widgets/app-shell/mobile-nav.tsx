import { NavLink } from "react-router-dom"
import { Home, List, Menu, Plus, Settings } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/shared/lib/cn"
import { Badge } from "@/components/ui/badge"

const LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/loans", label: "Loans", icon: List },
] as const

const SECOND_LINK = { to: "/settings", label: "Settings", icon: Settings } as const

/** Phone navigation: big targets for the thumb, Issue always one tap away, and "More" opens the sidebar sheet. */
export function MobileNav({ overdue, onNewLoan }: { overdue: number; onNewLoan: () => void }) {
  const { setOpenMobile } = useSidebar()
  const itemClass = (active: boolean) =>
    cn(
      "relative flex h-14 w-full flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors",
      active ? "text-foreground" : "text-faint",
    )

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
    >
      <ul className="mx-auto grid h-[4.25rem] max-w-md grid-cols-5 items-center px-2">
        {LINKS.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === "/"} className={({ isActive }) => itemClass(isActive)}>
              <item.icon className="size-[22px]" />
              {item.label}
              {item.to === "/loans" && overdue > 0 && (
                <Badge variant="destructive" className="absolute top-1 right-[calc(50%-24px)] h-[18px] min-w-[18px] px-1 tabular">
                  {overdue}
                </Badge>
              )}
            </NavLink>
          </li>
        ))}
        <li className="flex justify-center">
          <button
            type="button"
            onClick={onNewLoan}
            aria-label="Issue a new loan"
            className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float transition-transform active:scale-90"
          >
            <Plus className="size-6" />
          </button>
        </li>
        <li>
          <NavLink to={SECOND_LINK.to} className={({ isActive }) => itemClass(isActive)}>
            <SECOND_LINK.icon className="size-[22px]" />
            {SECOND_LINK.label}
          </NavLink>
        </li>
        <li>
          <button type="button" onClick={() => setOpenMobile(true)} className={itemClass(false)}>
            <Menu className="size-[22px]" />
            More
          </button>
        </li>
      </ul>
    </nav>
  )
}
