"use client";

import { Building2, CalendarClock, ChevronLeft, ChevronRight, ClipboardCheck, Home, LayoutDashboard, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Attendance", href: "/attendance", icon: ClipboardCheck },
  { label: "Leave", href: "/leave-requests", icon: CalendarClock }
];

type SidebarProps = {
  collapsed?: boolean;
  mobile?: boolean;
  isAdmin: boolean;
  profileHref: string | null;
  onCollapseChange?: (collapsed: boolean) => void;
  onNavigate?: () => void;
};

export function Sidebar({ collapsed = false, mobile = false, isAdmin, profileHref, onCollapseChange, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const navItems = isAdmin
    ? adminNavItems
    : [
        { label: "Home", href: "/", icon: Home },
        ...(profileHref ? [{ label: "My Profile", href: profileHref, icon: UserRound }] : []),
        { label: "Attendance", href: "/attendance", icon: ClipboardCheck },
        { label: "Leave", href: "/leave-requests", icon: CalendarClock }
      ];

  return (
    <aside className={cn("flex h-full flex-col border-r bg-card", !mobile && "hidden lg:flex")}>
      <div className={cn("flex h-16 items-center gap-3 border-b px-5", collapsed && !mobile && "justify-center px-3")}>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Building2 className="h-5 w-5" />
        </div>
        <div className={cn("min-w-0", collapsed && !mobile && "sr-only")}>
          <p className="text-sm font-semibold">ManageWise</p>
          <p className="text-xs text-muted-foreground">Operations</p>
        </div>
      </div>
      <nav className="grid flex-1 content-start gap-1 p-3">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed && !mobile ? item.label : undefined}
              onClick={onNavigate}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                collapsed && !mobile && "justify-center px-0",
                active && "bg-primary/10 text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className={cn(collapsed && !mobile && "sr-only")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {!mobile ? (
        <div className="border-t p-3">
          <Button
            type="button"
            variant="ghost"
            className={cn("w-full justify-start", collapsed && "justify-center px-0")}
            onClick={() => onCollapseChange?.(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className={cn(collapsed && "sr-only")}>Collapse</span>
          </Button>
        </div>
      ) : null}
    </aside>
  );
}
