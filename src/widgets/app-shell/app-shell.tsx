import { useEffect, type ReactNode } from "react"
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Plus, Search } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Kbd } from "@/components/ui/kbd"
import { Button } from "@/components/ui/button"
import { countByTab, useLoanEditor, useLoans } from "@/features/loans"
import { todayIso } from "@/shared/lib/dates"
import { CountBadge } from "@/shared/ui/pill"
import { BrandMark } from "./brand-mark"
import { DATA_NAV, MAIN_NAV, type NavItem } from "./nav-items"
import { MobileNav } from "./mobile-nav"

/**
 * The frame around every screen, built on the shadcn Sidebar: flush on
 * desktop (the default "sidebar" variant, no inset, and none of the
 * reference's segmented control), a slide-over sheet on phones, plus a bottom
 * bar with a central Issue button so issuing stays one tap away.
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
      const typing = target.closest("input, textarea, select, [contenteditable=true], [role=dialog], [role=alertdialog]")
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
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="flex-row items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-[15px] font-semibold tracking-[-0.01em]">Tally</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-lg text-muted-foreground"
            onClick={() => navigate("/loans?focus=search")}
            aria-label="Search loans"
            title="Search (Ctrl K)"
          >
            <Search />
          </Button>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="pt-0">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => openNew()} className="group/new rounded-lg text-muted-foreground">
                  <Plus className="transition-transform duration-200 group-hover/new:rotate-90" />
                  <span>New loan</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>
                  <Kbd>N</Kbd>
                </SidebarMenuBadge>
              </SidebarMenuItem>
              {MAIN_NAV.map((item) => (
                <NavEntry key={item.to} item={item} badge={item.badge === "overdue" ? overdue : 0} />
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Data</SidebarGroupLabel>
            <SidebarMenu>
              {DATA_NAV.map((item) => (
                <NavEntry key={item.to} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-4 pb-4">
          <div className="flex items-center gap-2 text-xs text-faint">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-text/40 [animation-duration:3s]" />
              <span className="relative inline-flex size-2 rounded-full bg-green-text" />
            </span>
            Saved in this browser
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0">
        {banner}
        <RouteFade>{children}</RouteFade>
      </SidebarInset>

      <MobileNav overdue={overdue} onNewLoan={() => openNew()} />
    </SidebarProvider>
  )
}

function NavEntry({ item, badge = 0 }: { item: NavItem; badge?: number }) {
  const location = useLocation()
  const active = matchPath({ path: item.to, end: item.to === "/" }, location.pathname) !== null
  const Icon = item.icon
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={active} render={<Link to={item.to} />} className="rounded-lg data-active:bg-sidebar-accent">
        <Icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
      {badge > 0 && (
        <SidebarMenuBadge>
          <CountBadge count={badge} />
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
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
