"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { isClerkConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export type DeleteAccountState = {
  ok: boolean;
  message: string;
};

export async function deleteCurrentAccount(): Promise<DeleteAccountState> {
  let userId: string | null = null;
  let isMock = false;

  if (!isClerkConfigured()) {
    const cookieStore = await cookies();
    userId = cookieStore.get("ems_mock_user_id")?.value ?? null;
    isMock = true;
  } else {
    const session = await auth();
    userId = session?.userId ?? null;
  }

  if (!userId) {
    return { ok: false, message: "Please sign in before deleting your account." };
  }

  try {
    let email: string | undefined;

    if (isMock) {
      const mockUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      email = mockUser?.email;
    } else {
      const clerkUser = await currentUser();
      email = clerkUser?.primaryEmailAddress?.emailAddress ?? undefined;
    }

    await prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        where: {
          OR: [
            { id: userId },
            { clerkId: userId },
            ...(email ? [{ email }] : [])
          ]
        },
        select: { id: true }
      });
      const userIds = users.map((user) => user.id);

      const employees = await tx.employee.findMany({
        where: {
          OR: [
            ...(userIds.length ? [{ userId: { in: userIds } }] : []),
            ...(email ? [{ email }] : [])
          ]
        },
        select: { id: true }
      });
      const employeeIds = employees.map((employee) => employee.id);

      if (employeeIds.length) {
        await tx.department.updateMany({
          where: { managerId: { in: employeeIds } },
          data: { managerId: null }
        });

        await tx.employee.deleteMany({
          where: { id: { in: employeeIds } }
        });
      }

      if (userIds.length) {
        await tx.user.deleteMany({
          where: { id: { in: userIds } }
        });
      }
    });

    if (isMock) {
      const cookieStore = await cookies();
      cookieStore.delete("ems_mock_user_id");
    } else {
      const client = await clerkClient();
      await client.users.deleteUser(userId);
    }

    revalidatePath("/");

    return { ok: true, message: "Your account was permanently deleted." };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Could not delete your account. Please try again." };
  }
}
