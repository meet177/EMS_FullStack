import { AdminAccessNotice, RoleSignIn } from "@/components/auth/role-auth";

export default async function AdminSignInPage({ searchParams }: { searchParams: Promise<{ adminExists?: string; adminOnly?: string }> }) {
  const params = await searchParams;

  if (params.adminExists === "1") {
    return <AdminAccessNotice type="admin-exists" />;
  }

  if (params.adminOnly === "1") {
    return <AdminAccessNotice type="admin-only" />;
  }

  return <RoleSignIn role="admin" />;
}
