import { NavLink } from "react-router-dom"
import { Home, List, Plus, Settings } from "lucide-react"
import { cn } from "@/shared/lib/cn"
import { CountBadge } from "@/shared/ui/pill"

const ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/loans", label: "Loans", icon: List },
  null, // the Issue button sits in the middle
  { to: "/loans?tab=overdue", label: "Overdue", icon: List },
  { to: "/settings", label: "More", icon: Settings },
] as const

/** Phone navigation: big targets for the thumb and Issue always one tap away. */
export function MobileNav({ overdue, onNewLoan }: { overdue: number; onNewLoan: () => void }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
    >
      <ul className="mx-auto grid h-[4.25rem] max-w-md grid-cols-5 items-center px-2">
        {ITEMS.map((item) =>
          item === null ? (
            <li key="issue" className="flex justify-center">
              <button
                type="button"
                onClick={onNewLoan}
                aria-label="Issue a new loan"
                className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float transition-transform active:scale-90"
              >
                <Plus className="size-6" />
              </button>
            </li>
          ) : (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors",
                    isActive ? "text-foreground" : "text-faint",
                  )
                }
              >
                <item.icon className="size-[22px]" />
                {item.label}
                {item.to === "/loans" && overdue > 0 && <CountBadge count={overdue} className="absolute top-1.5 right-[calc(50%-22px)]" />}
              </NavLink>
            </li>
          ),
        )}
      </ul>
    </nav>
  )
}
