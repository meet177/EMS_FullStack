import { EmployeeStatus, LeaveStatus, type Prisma } from "@/generated/prisma/client";

import { ensureDepartmentByCode, getDepartmentHeadcount } from "@/lib/db/departments";
import { prisma } from "@/lib/prisma";
import type { EmployeeInput, EmployeeProfileInput } from "@/lib/validators";

export const employeeWithDepartment = {
  include: { department: true }
} satisfies Prisma.EmployeeDefaultArgs;

export type EmployeeWithDepartment = Prisma.EmployeeGetPayload<typeof employeeWithDepartment>;

export async function syncEmployeeStatuses(txOrPrisma: any = prisma) {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  const employees = await txOrPrisma.employee.findMany({
    where: {
      status: { in: [EmployeeStatus.ACTIVE, EmployeeStatus.ON_LEAVE] }
    },
    select: {
      id: true,
      status: true,
      leaveRequests: {
        where: {
          status: LeaveStatus.APPROVED,
          startDate: { lte: todayUTC },
          endDate: { gte: todayUTC }
        },
        select: { id: true },
        take: 1
      }
    }
  });

  const toOnLeave: string[] = [];
  const toActive: string[] = [];

  for (const emp of employees) {
    const hasActiveLeave = emp.leaveRequests.length > 0;
    if (hasActiveLeave && emp.status !== EmployeeStatus.ON_LEAVE) {
      toOnLeave.push(emp.id);
    } else if (!hasActiveLeave && emp.status === EmployeeStatus.ON_LEAVE) {
      toActive.push(emp.id);
    }
  }

  if (toOnLeave.length > 0) {
    await txOrPrisma.employee.updateMany({
      where: { id: { in: toOnLeave } },
      data: { status: EmployeeStatus.ON_LEAVE }
    });
  }

  if (toActive.length > 0) {
    await txOrPrisma.employee.updateMany({
      where: { id: { in: toActive } },
      data: { status: EmployeeStatus.ACTIVE }
    });
  }
}


type EmployeeQuery = {
  search?: string;
  departmentCode?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

function getEmployeeWhere(query: EmployeeQuery): Prisma.EmployeeWhereInput {
  const search = query.search?.trim();

  return {
    ...(query.departmentCode
      ? {
          department: {
            code: query.departmentCode
          }
        }
      : {}),
    ...(search
      ? {
          OR: [
            { firstName: { startsWith: search, mode: "insensitive" } },
            { lastName: { startsWith: search, mode: "insensitive" } },
            { email: { startsWith: search, mode: "insensitive" } },
            { jobTitle: { startsWith: search, mode: "insensitive" } },
            { department: { name: { startsWith: search, mode: "insensitive" } } }
          ]
        }
      : {})
  };
}

function getEmployeeOrderBy(sort = "joinedAt", direction: "asc" | "desc" = "desc"): Prisma.EmployeeOrderByWithRelationInput[] {
  switch (sort) {
    case "name":
      return [{ firstName: direction }, { lastName: direction }];
    case "department":
      return [{ department: { name: direction } }, { firstName: "asc" }];
    case "role":
      return [{ jobTitle: direction }, { firstName: "asc" }];
    case "status":
      return [{ status: direction }, { firstName: "asc" }];
    case "salary":
      return [{ salary: direction }, { firstName: "asc" }];
    case "joinedAt":
    default:
      return [{ joinedAt: direction }, { firstName: "asc" }];
  }
}

export async function getEmployees(query: EmployeeQuery = {}) {
  return prisma.employee.findMany({
    ...employeeWithDepartment,
    where: getEmployeeWhere(query),
    orderBy: getEmployeeOrderBy(query.sort, query.direction)
  });
}

export async function getEmployeesPage(query: EmployeeQuery = {}) {
  const page = Math.max(query.page ?? 1, 1);
  const pageSize = Math.min(Math.max(query.pageSize ?? 10, 5), 50);
  const where = getEmployeeWhere(query);

  if (query.search) {
    const allMatches = await prisma.employee.findMany({
      ...employeeWithDepartment,
      where,
      orderBy: getEmployeeOrderBy(query.sort, query.direction)
    });

    const searchLower = query.search.toLowerCase();
    allMatches.sort((a, b) => {
      const aFirstMatch = a.firstName.toLowerCase().startsWith(searchLower);
      const bFirstMatch = b.firstName.toLowerCase().startsWith(searchLower);
      if (aFirstMatch && !bFirstMatch) return -1;
      if (!aFirstMatch && bFirstMatch) return 1;
      
      const aLastMatch = a.lastName.toLowerCase().startsWith(searchLower);
      const bLastMatch = b.lastName.toLowerCase().startsWith(searchLower);
      if (aLastMatch && !bLastMatch) return -1;
      if (!aLastMatch && bLastMatch) return 1;

      return 0;
    });

    const total = allMatches.length;
    const employees = allMatches.slice((page - 1) * pageSize, page * pageSize);

    return {
      employees,
      total,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1)
    };
  }

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      ...employeeWithDepartment,
      where,
      orderBy: getEmployeeOrderBy(query.sort, query.direction),
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.employee.count({ where })
  ]);

  return {
    employees,
    total,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil(total / pageSize), 1)
  };
}

export async function getEmployeeById(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      attendances: {
        orderBy: { date: "desc" },
        take: 10
      },
      leaveRequests: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  });
}

export async function getRecentEmployees(take = 5) {
  return prisma.employee.findMany({
    ...employeeWithDepartment,
    orderBy: { joinedAt: "desc" },
    take
  });
}

export async function createEmployeeRecord(input: EmployeeInput) {
  const { departmentCode, role, ...employee } = input;
  const department = await ensureDepartmentByCode(departmentCode);

  return prisma.employee.create({
    data: {
      ...employee,
      jobTitle: role,
      departmentId: department.id
    }
  });
}

export async function createEmployeeProfileForUser(userId: string, input: EmployeeProfileInput) {
  const { departmentCode, role, ...employee } = input;
  const department = await ensureDepartmentByCode(departmentCode);

  return prisma.employee.create({
    data: {
      ...employee,
      jobTitle: role,
      departmentId: department.id,
      userId
    }
  });
}

export async function updateEmployeeRecord(id: string, input: EmployeeInput) {
  const { departmentCode, role, ...employee } = input;
  const department = await ensureDepartmentByCode(departmentCode);

  return prisma.employee.update({
    where: { id },
    data: {
      ...employee,
      jobTitle: role,
      departmentId: department.id
    }
  });
}

export function deleteEmployeeRecord(id: string) {
  return prisma.employee.delete({ where: { id } });
}

export function updateEmployeeSalaryRecord(id: string, salary: number) {
  return prisma.employee.update({
    where: { id },
    data: { salary }
  });
}

export async function getDashboardMetrics() {
  const [totalEmployees, activeEmployees, departmentCount, pendingLeaveRequests, onLeaveEmployees, payrollTotal, recentEmployees, departments, statusGroups] =
    await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: EmployeeStatus.ACTIVE } }),
      prisma.department.count(),
      prisma.leaveRequest.count({ where: { status: LeaveStatus.PENDING } }),
      prisma.employee.count({ where: { status: EmployeeStatus.ON_LEAVE } }),
      prisma.employee.aggregate({ _sum: { salary: true } }),
      getRecentEmployees(),
      getDepartmentHeadcount(),
      prisma.employee.groupBy({
        by: ["status"],
        where: { status: { in: [EmployeeStatus.ACTIVE, EmployeeStatus.ON_LEAVE] } },
        _count: { status: true }
      })
    ]);

  return {
    totalEmployees,
    activeEmployees,
    departmentCount,
    pendingLeaveRequests,
    onLeaveEmployees,
    payrollTotal: payrollTotal._sum.salary,
    recentEmployees,
    departments: departments.map((department) => ({
      department: {
        id: department.id,
        name: department.name,
        code: department.code
      },
      _count: { employees: department._count.employees }
    })),
    departmentChartData: departments.map((department) => ({
      name: department.name,
      employees: department._count.employees
    })),
    statusChartData: statusGroups.map((group) => ({
      name: group.status,
      value: group._count.status
    }))
  };
}
