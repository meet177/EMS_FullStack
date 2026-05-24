import { departments } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export function getDepartments() {
  return prisma.department.findMany({
    orderBy: { name: "asc" }
  });
}

export function getDepartmentHeadcount() {
  return prisma.department.findMany({
    include: { _count: { select: { employees: true } } },
    orderBy: { employees: { _count: "desc" } }
  });
}

export async function ensureDepartmentByCode(code: string) {
  const fallback = departments.find((department) => department.code === code);

  return prisma.department.upsert({
    where: { code },
    update: {},
    create: {
      code,
      name: fallback?.name ?? code
    }
  });
}
