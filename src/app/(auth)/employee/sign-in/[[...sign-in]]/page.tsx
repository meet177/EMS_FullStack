import { AdminAccessNotice, RoleSignIn } from "@/components/auth/role-auth";

export default async function EmployeeSignInPage({ searchParams }: { searchParams: Promise<{ employeeOnly?: string }> }) {
  const params = await searchParams;

  if (params.employeeOnly === "1") {
    return <AdminAccessNotice type="employee-only" />;
  }

  return <RoleSignIn role="employee" />;
}
