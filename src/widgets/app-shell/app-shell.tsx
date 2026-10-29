import { useEffect, type ReactNode } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Plus, Search } from "lucide-react"
import { countByTab, useLoanEditor, useLoans } from "@/features/loans"
import { cn } from "@/shared/lib/cn"
import { todayIso } from "@/shared/lib/dates"
import { CountBadge } from "@/shared/ui/pill"
import { Kbd } from "@/shared/ui/search-field"
import { BrandMark } from "./brand-mark"
import { DATA_NAV, MAIN_NAV, type NavItem } from "./nav-items"
import { MobileNav } from "./mobile-nav"

/**
 * The frame around every screen: a quiet grey sidebar on desktop (after the
 * sidebar reference, flush with no inset and without its segmented control)
 * and a bottom bar with a central Issue button on phones.
 */
export function AppShell({ children, banner }: { children: ReactNode; banner?: ReactNode }) {
  const { openNew } = useLoanEditor()
  const navigate = useNavigate()
  const { data: loans } = useLoans()
  const overdue = loans ? countByTab(loans, todayIso()).overdue : 0

  // N opens a new loan, Ctrl/⌘+K jumps to search: the counter stays keyboard-only.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const typing = target.closest("input, textarea, select, [contenteditable=true], [role=dialog]")
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        navigate("/loans?focus=search")
      } else if (!typing && !event.metaKey && !event.ctrlKey && !event.altKey && event.key.toLowerCase() === "n") {
        event.preventDefault()
        openNew()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [navigate, openNew])

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-border bg-sidebar px-3 py-3 lg:flex">
        <div className="flex items-center justify-between px-2 pb-5">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-[15px] font-semibold tracking-[-0.01em]">Tally</span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/loans?focus=search")}
            aria-label="Search loans"
            title="Search (Ctrl K)"
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground"
          >
            <Search className="size-[18px]" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => openNew()}
          className="group mb-1 flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground"
        >
          <Plus className="size-[18px] transition-transform duration-200 group-hover:rotate-90" />
          <span className="flex-1 text-left">New loan</span>
          <Kbd>N</Kbd>
        </button>

        <nav aria-label="Main" className="flex flex-col gap-0.5">
          {MAIN_NAV.map((item) => (
            <SidebarLink key={item.to} item={item} badge={item.badge === "overdue" ? overdue : 0} />
          ))}
        </nav>

        <p className="mt-7 mb-1.5 px-2.5 text-xs text-faint">Data</p>
        <nav aria-label="Data" className="flex flex-col gap-0.5">
          {DATA_NAV.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-2 px-2.5 text-xs text-faint">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-text/40 [animation-duration:3s]" />
            <span className="relative inline-flex size-2 rounded-full bg-green-text" />
          </span>
          Saved in this browser
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0">
        <main className="relative flex min-h-full flex-1 flex-col bg-background">
          {banner}
          <RouteFade>{children}</RouteFade>
        </main>
      </div>

      <MobileNav overdue={overdue} onNewLoan={() => openNew()} />
    </div>
  )
}

function SidebarLink({ item, badge = 0 }: { item: NavItem; badge?: number }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        cn(
          "relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm transition-colors",
          isActive ? "font-medium text-foreground" : "text-muted-foreground hover:bg-subtle hover:text-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-lg bg-subtle-strong/70"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          <Icon className="relative size-[18px]" />
          <span className="relative flex-1">{item.label}</span>
          <CountBadge count={badge} className="relative" />
        </>
      )}
    </NavLink>
  )
}

/** A soft fade and lift between screens. */
function RouteFade({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-0 flex-1 flex-col"
    >
      {children}
    </motion.div>
  )
}
