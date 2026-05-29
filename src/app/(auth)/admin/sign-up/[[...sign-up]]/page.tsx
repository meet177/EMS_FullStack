import { RoleSignUp } from "@/components/auth/role-auth";
import { hasPrimaryAdminUser } from "@/lib/db/users";

export default async function AdminSignUpPage() {
  const adminExists = await hasPrimaryAdminUser();

  return <RoleSignUp role="admin" disabledReason={adminExists ? "admin-exists" : undefined} />;
}
