import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { UserRole } from "@prisma/client";
import { getPrimaryAdminUser, getUserByClerkId, upsertUserFromClerk } from "@/lib/db/users";

function getRequestedRole(...metadataList: Array<Record<string, unknown> | undefined>) {
  return metadataList.some((metadata) => metadata?.role === UserRole.ADMIN) ? UserRole.ADMIN : UserRole.EMPLOYEE;
}

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const existingUser = await getUserByClerkId(userId);
  if (existingUser) return existingUser;

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;

  if (!clerkUser || !email) {
    redirect("/sign-in");
  }

  const requestedRole = getRequestedRole(clerkUser.unsafeMetadata, clerkUser.publicMetadata);

  if (requestedRole === UserRole.ADMIN) {
    const primaryAdmin = await getPrimaryAdminUser();

    if (primaryAdmin && primaryAdmin.clerkId !== clerkUser.id) {
      redirect("/admin/sign-in?adminExists=1");
    }
  }

  return upsertUserFromClerk({
    clerkId: clerkUser.id,
    email,
    name: clerkUser.fullName,
    role: requestedRole
  });
}

export async function getAccessContext() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === UserRole.ADMIN;
  const employeeId = user?.employee?.id ?? null;

  return {
    user,
    isAdmin,
    role: isAdmin ? UserRole.ADMIN : UserRole.EMPLOYEE,
    employeeId,
    profileHref: employeeId ? `/employees/${employeeId}` : null
  };
}

export async function requireAdmin() {
  const context = await getAccessContext();

  if (!context.user) {
    redirect("/sign-in");
  }

  if (!context.isAdmin) {
    redirect("/admin/sign-in?adminOnly=1");
  }

  return context;
}

export async function requireEmployeeProfileAccess(employeeId: string) {
  const context = await getAccessContext();

  if (!context.user) {
    redirect("/sign-in");
  }

  if (!context.isAdmin && context.employeeId !== employeeId) {
    redirect(context.profileHref ?? "/attendance");
  }

  return context;
}

export async function getOptionalCurrentUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const existingUser = await getUserByClerkId(userId);
    if (existingUser) return existingUser;

    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress;

    if (!clerkUser || !email) {
      return null;
    }

    const requestedRole = getRequestedRole(clerkUser.unsafeMetadata, clerkUser.publicMetadata);

    if (requestedRole === UserRole.ADMIN) {
      const primaryAdmin = await getPrimaryAdminUser();

      if (primaryAdmin && primaryAdmin.clerkId !== clerkUser.id) {
        return null;
      }
    }

    return await upsertUserFromClerk({
      clerkId: clerkUser.id,
      email,
      name: clerkUser.fullName,
      role: requestedRole
    });
  } catch {
    return null;
  }
}

export async function getOptionalAccessContext() {
  try {
    const user = await getOptionalCurrentUser();
    if (!user) return null;
    const isAdmin = user.role === UserRole.ADMIN;
    const employeeId = user.employee?.id ?? null;

    return {
      user,
      isAdmin,
      role: isAdmin ? UserRole.ADMIN : UserRole.EMPLOYEE,
      employeeId,
      profileHref: employeeId ? `/employees/${employeeId}` : null
    };
  } catch (error) {
    console.error("Error in getOptionalAccessContext:", error);
    return null;
  }
}
