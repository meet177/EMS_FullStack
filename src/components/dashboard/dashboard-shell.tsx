"use client";

import { useEffect, useState } from "react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { cn } from "@/lib/utils";

export function DashboardShell({
  children,
  clerkEnabled,
  isAdmin,
  profileHref,
  userName,
  userEmail
}: {
  children: React.ReactNode;
  clerkEnabled: boolean;
  isAdmin: boolean;
  profileHref: string | null;
  userName: string;
  userEmail: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("ems-sidebar-collapsed");
    setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ems-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <div
      className={cn(
        "grid min-h-screen bg-background transition-[grid-template-columns] duration-300 lg:grid-cols-[260px_1fr]",
        collapsed && "lg:grid-cols-[84px_1fr]"
      )}
    >
      <Sidebar collapsed={collapsed} onCollapseChange={setCollapsed} isAdmin={isAdmin} profileHref={profileHref} />
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-[min(320px,85vw)] border-r bg-card shadow-soft">
            <Sidebar collapsed={false} mobile onNavigate={() => setMobileOpen(false)} isAdmin={isAdmin} profileHref={profileHref} />
          </div>
        </div>
      ) : null}
      <div className="min-w-0">
        <Topbar
          clerkEnabled={clerkEnabled}
          isAdmin={isAdmin}
          onMenuClick={() => setMobileOpen(true)}
          userName={userName}
          userEmail={userEmail}
        />
        <main className="mx-auto w-full max-w-7xl px-4 py-5 animate-in fade-in slide-in-from-bottom-2 duration-500 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
