import { Prisma, UserRole } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

type UpsertUserInput = {
  clerkId: string;
  email: string;
  name?: string | null;
  role?: UserRole;
};

export function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    include: { employee: true }
  });
}

export function getPrimaryAdminUser() {
  return prisma.user.findFirst({
    where: {
      role: UserRole.ADMIN,
      clerkId: { not: { startsWith: "seed_" } }
    },
    orderBy: { createdAt: "asc" }
  });
}

export async function hasPrimaryAdminUser() {
  const count = await prisma.user.count({
    where: {
      role: UserRole.ADMIN,
      clerkId: { not: { startsWith: "seed_" } }
    }
  });

  return count > 0;
}

export async function upsertUserFromClerk(input: UpsertUserInput) {
  const role = input.role ?? UserRole.EMPLOYEE;

  try {
    return await prisma.$transaction(async (tx) => {
      const existingByClerkId = await tx.user.findUnique({
        where: { clerkId: input.clerkId },
        include: { employee: true }
      });

      const existingByEmail = existingByClerkId
        ? null
        : await tx.user.findUnique({
            where: { email: input.email },
            include: { employee: true }
          });

      const user = existingByClerkId
        ? await tx.user.update({
            where: { id: existingByClerkId.id },
            data: {
              email: input.email,
              name: input.name,
              role
            },
            include: { employee: true }
          })
        : existingByEmail
          ? await tx.user.update({
              where: { id: existingByEmail.id },
              data: {
                clerkId: input.clerkId,
                name: input.name,
                role
              },
              include: { employee: true }
            })
          : await tx.user.create({
              data: {
                clerkId: input.clerkId,
                email: input.email,
                name: input.name,
                role
              },
              include: { employee: true }
            });

      if (role === UserRole.EMPLOYEE && !user.employee) {
        await tx.employee.updateMany({
          where: {
            email: input.email,
            userId: null
          },
          data: { userId: user.id }
        });
      }

      return tx.user.findUnique({
        where: { id: user.id },
        include: { employee: true }
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return prisma.user.findFirst({
        where: {
          OR: [{ clerkId: input.clerkId }, { email: input.email }]
        },
        include: { employee: true }
      });
    }

    throw error;
  }
}
