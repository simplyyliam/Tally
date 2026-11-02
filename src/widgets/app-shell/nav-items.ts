import { Database, FileSpreadsheet, History, Home, List, Settings, Users, type LucideIcon } from "lucide-react"

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Shows the overdue count badge. */
  badge?: "overdue"
}

export const MAIN_NAV: ReadonlyArray<NavItem> = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/loans", label: "Loans", icon: List, badge: "overdue" },
  { to: "/borrowers", label: "Borrowers", icon: Users },
  { to: "/activity", label: "Activity", icon: History },
]

export const DATA_NAV: ReadonlyArray<NavItem> = [
  { to: "/import", label: "Import", icon: FileSpreadsheet },
  { to: "/backup", label: "Backup & restore", icon: Database },
  { to: "/settings", label: "Settings", icon: Settings },
]
