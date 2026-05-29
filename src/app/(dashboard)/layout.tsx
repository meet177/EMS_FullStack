import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getAccessContext } from "@/lib/authz";


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, profileHref } = await getAccessContext();
  const userName = user?.name ?? user?.email ?? "";
  const userEmail = user?.email ?? "";

  return (
    <DashboardShell
      clerkEnabled={true}
      isAdmin={isAdmin}
      profileHref={profileHref}
      userName={userName}
      userEmail={userEmail}
    >
      {children}
    </DashboardShell>
  );
}
