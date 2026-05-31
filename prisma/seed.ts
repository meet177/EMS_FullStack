import "dotenv/config";

import {
  AttendanceStatus,
  EmployeeStatus,
  LeaveStatus,
  LeaveType,
  PrismaClient,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

const departments = [
  { code: "ENGINEERING", name: "Engineering", description: "Builds and operates the employee management platform." },
  { code: "PRODUCT", name: "Product", description: "Owns roadmap, discovery, and product delivery." },
  { code: "DESIGN", name: "Design", description: "Shapes user experience and interface quality." },
  { code: "SALES", name: "Sales", description: "Manages revenue, partnerships, and customer growth." },
  { code: "MARKETING", name: "Marketing", description: "Runs campaigns, brand, and demand generation." },
  { code: "FINANCE", name: "Finance", description: "Handles payroll, budgets, and financial reporting." },
  { code: "PEOPLE", name: "People", description: "Supports hiring, employee relations, and culture." },
  { code: "OPERATIONS", name: "Operations", description: "Keeps internal systems and facilities running." }
];

const employees = [
  {
    firstName: "Aarav",
    lastName: "Mehta",
    email: "aarav.mehta@example.com",
    phone: "+91 98765 43010",
    jobTitle: "Engineering Manager",
    departmentCode: "ENGINEERING",
    status: EmployeeStatus.ACTIVE,
    salary: 3200000,
    joinedAt: new Date("2022-04-12"),
    user: {
      clerkId: "seed_employee_aarav",
      email: "aarav.mehta@example.com",
      name: "Aarav Mehta"
    }
  },
  {
    firstName: "Isha",
    lastName: "Rao",
    email: "isha.rao@example.com",
    phone: "+91 98765 43011",
    jobTitle: "Product Designer",
    departmentCode: "DESIGN",
    status: EmployeeStatus.ACTIVE,
    salary: 2200000,
    joinedAt: new Date("2023-01-17"),
    user: {
      clerkId: "seed_employee_isha",
      email: "isha.rao@example.com",
      name: "Isha Rao"
    }
  },
  {
    firstName: "Kabir",
    lastName: "Sinha",
    email: "kabir.sinha@example.com",
    jobTitle: "Sales Lead",
    departmentCode: "SALES",
    status: EmployeeStatus.ON_LEAVE,
    salary: 2400000,
    joinedAt: new Date("2021-09-03"),
    user: {
      clerkId: "seed_employee_kabir",
      email: "kabir.sinha@example.com",
      name: "Kabir Sinha"
    }
  },
  {
    firstName: "Naina",
    lastName: "Kapoor",
    email: "naina.kapoor@example.com",
    phone: "+91 98765 43012",
    jobTitle: "People Ops Partner",
    departmentCode: "PEOPLE",
    status: EmployeeStatus.ACTIVE,
    salary: 1800000,
    joinedAt: new Date("2024-02-21"),
    user: {
      clerkId: "seed_employee_naina",
      email: "naina.kapoor@example.com",
      name: "Naina Kapoor"
    }
  },
  {
    firstName: "Rohan",
    lastName: "Malik",
    email: "rohan.malik@example.com",
    phone: "+91 98765 43013",
    jobTitle: "Finance Analyst",
    departmentCode: "FINANCE",
    status: EmployeeStatus.ACTIVE,
    salary: 1600000,
    joinedAt: new Date("2020-11-08")
  },
  {
    firstName: "Meera",
    lastName: "Nair",
    email: "meera.nair@example.com",
    phone: "+91 98765 43014",
    jobTitle: "Product Manager",
    departmentCode: "PRODUCT",
    status: EmployeeStatus.ACTIVE,
    salary: 2700000,
    joinedAt: new Date("2022-08-29"),
    user: {
      clerkId: "seed_employee_meera",
      email: "meera.nair@example.com",
      name: "Meera Nair"
    }
  },
  {
    firstName: "Dev",
    lastName: "Bansal",
    email: "dev.bansal@example.com",
    phone: "+91 98765 43015",
    jobTitle: "Frontend Engineer",
    departmentCode: "ENGINEERING",
    status: EmployeeStatus.ACTIVE,
    salary: 2100000,
    joinedAt: new Date("2023-06-05"),
    user: {
      clerkId: "seed_employee_dev",
      email: "dev.bansal@example.com",
      name: "Dev Bansal"
    }
  },
  {
    firstName: "Tara",
    lastName: "Gill",
    email: "tara.gill@example.com",
    phone: "+91 98765 43016",
    jobTitle: "Marketing Specialist",
    departmentCode: "MARKETING",
    status: EmployeeStatus.ACTIVE,
    salary: 1500000,
    joinedAt: new Date("2024-09-16")
  },
  {
    firstName: "Arjun",
    lastName: "Menon",
    email: "arjun.menon@example.com",
    phone: "+91 98765 43017",
    jobTitle: "Operations Coordinator",
    departmentCode: "OPERATIONS",
    status: EmployeeStatus.ACTIVE,
    salary: 1400000,
    joinedAt: new Date("2025-01-13")
  }
];

const departmentManagers: Record<string, string> = {
  ENGINEERING: "aarav.mehta@example.com",
  PRODUCT: "meera.nair@example.com",
  DESIGN: "isha.rao@example.com",
  SALES: "kabir.sinha@example.com",
  PEOPLE: "naina.kapoor@example.com"
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function dayOfCurrentMonth(day: number) {
  const now = new Date();
  return startOfDay(new Date(now.getFullYear(), now.getMonth(), day));
}

function atTime(date: Date, hours: number, minutes: number) {
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function attendanceFor(employeeEmail: string, day: number, status: AttendanceStatus, notes?: string) {
  const date = dayOfCurrentMonth(day);
  const hasWorkdayTime = status !== AttendanceStatus.ABSENT;

  return {
    employeeEmail,
    date,
    checkIn: hasWorkdayTime ? atTime(date, status === AttendanceStatus.LATE ? 10 : 9, status === AttendanceStatus.LATE ? 35 : 15) : null,
    checkOut: hasWorkdayTime ? atTime(date, status === AttendanceStatus.HALF_DAY ? 13 : 18, status === AttendanceStatus.HALF_DAY ? 15 : 10) : null,
    status,
    notes
  };
}

const attendanceRecords = [
  attendanceFor("aarav.mehta@example.com", 1, AttendanceStatus.PRESENT),
  attendanceFor("aarav.mehta@example.com", 2, AttendanceStatus.WORK_FROM_HOME, "Architecture planning day."),
  attendanceFor("aarav.mehta@example.com", 5, AttendanceStatus.LATE, "Delayed by client escalation."),
  attendanceFor("isha.rao@example.com", 1, AttendanceStatus.PRESENT),
  attendanceFor("isha.rao@example.com", 2, AttendanceStatus.PRESENT),
  attendanceFor("isha.rao@example.com", 5, AttendanceStatus.HALF_DAY, "Design workshop in the morning."),
  attendanceFor("kabir.sinha@example.com", 1, AttendanceStatus.ABSENT, "Approved leave."),
  attendanceFor("kabir.sinha@example.com", 2, AttendanceStatus.ABSENT, "Approved leave."),
  attendanceFor("naina.kapoor@example.com", 1, AttendanceStatus.PRESENT),
  attendanceFor("naina.kapoor@example.com", 2, AttendanceStatus.LATE, "Campus hiring travel."),
  attendanceFor("meera.nair@example.com", 1, AttendanceStatus.WORK_FROM_HOME),
  attendanceFor("meera.nair@example.com", 2, AttendanceStatus.PRESENT),
  attendanceFor("dev.bansal@example.com", 1, AttendanceStatus.PRESENT),
  attendanceFor("dev.bansal@example.com", 2, AttendanceStatus.PRESENT),
  attendanceFor("dev.bansal@example.com", 5, AttendanceStatus.ABSENT, "Sick day."),
  attendanceFor("tara.gill@example.com", 1, AttendanceStatus.PRESENT),
  attendanceFor("tara.gill@example.com", 2, AttendanceStatus.WORK_FROM_HOME, "Campaign launch support."),
  attendanceFor("arjun.menon@example.com", 1, AttendanceStatus.PRESENT),
  attendanceFor("arjun.menon@example.com", 2, AttendanceStatus.HALF_DAY, "Facilities vendor visit.")
];

const leaveRequests = [
  {
    id: "seed_leave_kabir_paid_current",
    employeeEmail: "kabir.sinha@example.com",
    reviewerEmail: null,
    type: LeaveType.PAID,
    status: LeaveStatus.APPROVED,
    startDate: dayOfCurrentMonth(1),
    endDate: dayOfCurrentMonth(4),
    reason: "Family travel planned in advance.",
    reviewNote: "Approved with coverage from the regional sales team.",
    reviewedAt: dayOfCurrentMonth(1)
  },
  {
    id: "seed_leave_dev_sick",
    employeeEmail: "dev.bansal@example.com",
    reviewerEmail: null,
    type: LeaveType.SICK,
    status: LeaveStatus.APPROVED,
    startDate: dayOfCurrentMonth(5),
    endDate: dayOfCurrentMonth(5),
    reason: "Recovering from fever.",
    reviewNote: "Approved. Please update the team when back online.",
    reviewedAt: dayOfCurrentMonth(5)
  },
  {
    id: "seed_leave_isha_casual_pending",
    employeeEmail: "isha.rao@example.com",
    reviewerEmail: null,
    type: LeaveType.CASUAL,
    status: LeaveStatus.PENDING,
    startDate: dayOfCurrentMonth(18),
    endDate: dayOfCurrentMonth(19),
    reason: "Personal work requiring two days away.",
    reviewNote: null,
    reviewedAt: null
  },
  {
    id: "seed_leave_meera_unpaid_rejected",
    employeeEmail: "meera.nair@example.com",
    reviewerEmail: null,
    type: LeaveType.UNPAID,
    status: LeaveStatus.REJECTED,
    startDate: dayOfCurrentMonth(10),
    endDate: dayOfCurrentMonth(12),
    reason: "Extended personal travel.",
    reviewNote: "Rejected due to release planning week.",
    reviewedAt: dayOfCurrentMonth(8)
  },
  {
    id: "seed_leave_naina_bereavement",
    employeeEmail: "naina.kapoor@example.com",
    reviewerEmail: null,
    type: LeaveType.BEREAVEMENT,
    status: LeaveStatus.APPROVED,
    startDate: dayOfCurrentMonth(22),
    endDate: dayOfCurrentMonth(24),
    reason: "Family bereavement.",
    reviewNote: "Approved with full support.",
    reviewedAt: dayOfCurrentMonth(20)
  }
];

async function main() {
  for (const department of departments) {
    await prisma.department.upsert({
      where: { code: department.code },
      update: department,
      create: department
    });
  }

  await prisma.user.deleteMany({
    where: { clerkId: "seed_admin" }
  });

  for (const employee of employees) {
    const department = await prisma.department.findUniqueOrThrow({
      where: { code: employee.departmentCode }
    });

    const user = employee.user
      ? await prisma.user.upsert({
          where: { email: employee.user.email },
          update: {
            clerkId: employee.user.clerkId,
            name: employee.user.name,
            role: UserRole.EMPLOYEE
          },
          create: {
            ...employee.user,
            role: UserRole.EMPLOYEE
          }
        })
      : null;

    const { departmentCode, user: _user, ...data } = employee;

    await prisma.employee.upsert({
      where: { email: data.email },
      update: {
        ...data,
        departmentId: department.id,
        userId: user?.id ?? null
      },
      create: {
        ...data,
        departmentId: department.id,
        userId: user?.id ?? null
      }
    });
  }

  for (const [departmentCode, managerEmail] of Object.entries(departmentManagers)) {
    const manager = await prisma.employee.findUniqueOrThrow({ where: { email: managerEmail } });

    await prisma.department.update({
      where: { code: departmentCode },
      data: { managerId: manager.id }
    });
  }

  for (const record of attendanceRecords) {
    const employee = await prisma.employee.findUniqueOrThrow({
      where: { email: record.employeeEmail }
    });

    await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: record.date
        }
      },
      update: {
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        notes: record.notes ?? null
      },
      create: {
        employeeId: employee.id,
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        notes: record.notes ?? null
      }
    });
  }

  for (const request of leaveRequests) {
    const employee = await prisma.employee.findUniqueOrThrow({
      where: { email: request.employeeEmail }
    });

    await prisma.leaveRequest.upsert({
      where: { id: request.id },
      update: {
        employeeId: employee.id,
        reviewerId: null,
        type: request.type,
        status: request.status,
        startDate: request.startDate,
        endDate: request.endDate,
        reason: request.reason,
        reviewNote: request.reviewNote,
        reviewedAt: request.reviewedAt
      },
      create: {
        id: request.id,
        employeeId: employee.id,
        reviewerId: null,
        type: request.type,
        status: request.status,
        startDate: request.startDate,
        endDate: request.endDate,
        reason: request.reason,
        reviewNote: request.reviewNote,
        reviewedAt: request.reviewedAt
      }
    });
  }

  console.log(`Seeded ${departments.length} departments, ${employees.length} employees, ${attendanceRecords.length} attendance records, and ${leaveRequests.length} leave requests.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
