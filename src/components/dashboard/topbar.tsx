import { Menu } from "lucide-react";

import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { Button } from "@/components/ui/button";

export function Topbar({
  clerkEnabled,
  isAdmin,
  onMenuClick,
  userName,
  userEmail
}: {
  clerkEnabled: boolean;
  isAdmin: boolean;
  onMenuClick: () => void;
  userName: string;
  userEmail: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-xl md:px-6 lg:px-8">
      <Button type="button" variant="outline" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open navigation">
        <Menu className="h-4 w-4" />
      </Button>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-none">{isAdmin ? "Admin Dashboard" : "Employee Portal"}</p>
        <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
          {isAdmin ? "Manage people, teams, and operations" : "View your profile, attendance, and leave requests"}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserMenu clerkEnabled={clerkEnabled} userName={userName} userEmail={userEmail} />
      </div>
    </header>
  );
}
