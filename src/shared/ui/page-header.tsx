import { Fragment, type ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/shared/lib/cn"

export interface Crumb {
  label: string
  to: string
}

interface PageHeaderProps {
  icon?: ReactNode
  title: string
  /** The pages above this one, e.g. [{ label: "Loans", to: "/loans" }]. */
  breadcrumbs?: ReadonlyArray<Crumb>
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * The top bar of every screen: shadcn breadcrumbs ("Loans / Thandi Nkosi", as
 * in the "Agents / Campaign manager" reference) with the current page in a soft
 * grey chip like the conversation title in the sidebar reference.
 */
export function PageHeader({ icon, title, breadcrumbs = [], subtitle, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex min-h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md md:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap text-[15px]">
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={crumb.to}>
                {/* On a phone only the nearest parent is shown, to keep the title readable. */}
                <BreadcrumbItem className={cn(index < breadcrumbs.length - 1 && "hidden sm:inline-flex")}>
                  <BreadcrumbLink render={<Link to={crumb.to} />} className="whitespace-nowrap">
                    {crumb.label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className={cn(index < breadcrumbs.length - 1 && "hidden sm:inline-flex")} />
              </Fragment>
            ))}
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="inline-flex h-8 min-w-0 items-center gap-2 rounded-lg bg-muted px-2.5 font-medium tracking-[-0.01em] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
                {icon}
                <span className="truncate">{title}</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {subtitle && <div className="hidden min-w-0 truncate text-[13px] text-muted-foreground lg:block">{subtitle}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
