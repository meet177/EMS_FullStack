import { AttendanceStatus, EmployeeStatus } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";


type AttendanceInput = {
  employeeId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  notes?: string;
  clientTimeZone?: string;
};

type AttendanceQuery = {
  employeeId?: string;
  month?: string;
  take?: number;
};

export class AttendanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttendanceError";
  }
}

function startOfDay(date: Date) {
  const next = new Date(date);
  return new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth(), next.getUTCDate()));
}

function combineDateAndTime(date: Date, time?: Date) {
  if (!time) return undefined;

  const next = startOfDay(date);
  next.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return next;
}

function getMonthRange(month?: string) {
  const match = month?.match(/^(\d{4})-(\d{2})$/);
  const now = new Date();
  const year = match ? Number(match[1]) : now.getFullYear();
  const monthIndex = match ? Number(match[2]) - 1 : now.getMonth();
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);

  return { start, end, label: `${year}-${String(monthIndex + 1).padStart(2, "0")}` };
}

export async function getAttendanceForEmployee(employeeId: string) {
  return prisma.attendance.findMany({
    where: { employeeId },
    orderBy: { date: "desc" }
  });
}

export async function getAttendanceRecords(query: AttendanceQuery = {}) {
  const range = getMonthRange(query.month);

  return prisma.attendance.findMany({
    where: {
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      date: {
        gte: range.start,
        lt: range.end
      }
    },
    include: {
      employee: {
        include: { department: true }
      }
    },
    orderBy: [{ date: "desc" }, { employee: { firstName: "asc" } }],
    take: query.take
  });
}

export async function getAttendanceSummary(query: AttendanceQuery = {}) {
  const range = getMonthRange(query.month);
  const where = {
    ...(query.employeeId ? { employeeId: query.employeeId } : {}),
    date: {
      gte: range.start,
      lt: range.end
    }
  };

  const [records, activeEmployees] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        employee: {
          include: { department: true }
        }
      },
      orderBy: [{ date: "desc" }, { employee: { firstName: "asc" } }]
    }),
    query.employeeId ? Promise.resolve(1) : prisma.employee.count()
  ]);

  const statusCounts = Object.values(AttendanceStatus).reduce<Record<AttendanceStatus, number>>((counts, status) => {
    counts[status] = records.filter((record) => record.status === status).length;
    return counts;
  }, {} as Record<AttendanceStatus, number>);
  const attended = statusCounts.PRESENT + statusCounts.LATE + statusCounts.HALF_DAY + statusCounts.WORK_FROM_HOME;
  const markedDays = new Set(records.map((record) => record.date.toISOString().slice(0, 10))).size;
  const expectedMarks = Math.max(activeEmployees * Math.max(markedDays, 1), 1);

  return {
    month: range.label,
    records,
    totalRecords: records.length,
    activeEmployees,
    markedDays,
    attended,
    absent: statusCounts.ABSENT,
    late: statusCounts.LATE,
    attendanceRate: Math.round((attended / Math.max(records.length, 1)) * 100),
    completionRate: Math.round((records.length / expectedMarks) * 100),
    statusCounts
  };
}

export async function getEmployeeAttendanceStatistics(employeeId: string, month?: string) {
  const summary = await getAttendanceSummary({ employeeId, month });

  return {
    totalRecords: summary.totalRecords,
    presentLikeDays: summary.attended,
    absentDays: summary.absent,
    lateDays: summary.late,
    attendanceRate: summary.attendanceRate,
    statusCounts: summary.statusCounts
  };
}

export async function getYearlyAttendancePercentage(employeeId: string, year: number) {
  const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
  const summaries = await Promise.all(
    months.map((month) => getAttendanceSummary({ employeeId, month }))
  );
  
  return summaries.map((summary, index) => ({
    month: months[index],
    percentage: summary.attendanceRate
  }));
}

export async function upsertAttendance(input: AttendanceInput) {
  const date = startOfDay(input.date);
  const clientTimeZone = input.clientTimeZone ?? "UTC";

  const combineDateAndTimeInTimeZone = (d: Date, t?: Date) => {
    if (!t) return undefined;
    const dateString = d.toISOString().slice(0, 10);
    const timeString = `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
    const tzDate = new Date(`${dateString}T${timeString}:00`);
    const temp = new Date(tzDate.toLocaleString("en-US", { timeZone: clientTimeZone }));
    const diff = tzDate.getTime() - temp.getTime();
    return new Date(tzDate.getTime() + diff);
  };

  const checkIn = combineDateAndTimeInTimeZone(date, input.checkIn);
  const checkOut = combineDateAndTimeInTimeZone(date, input.checkOut);

  if (checkIn && checkOut && checkOut <= checkIn) {
    throw new AttendanceError("Check out must be after check in.");
  }

  return prisma.$transaction(async (tx) => {
    const employee = await tx.employee.findUnique({
      where: { id: input.employeeId },
      select: { id: true, status: true }
    });

    if (!employee) {
      throw new AttendanceError("Select a valid employee.");
    }

    if (employee.status === EmployeeStatus.ON_LEAVE && input.status !== AttendanceStatus.ABSENT) {
      throw new AttendanceError("Employees on leave can only be marked absent.");
    }

    return tx.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: input.employeeId,
          date
        }
      },
      update: {
        checkIn: checkIn ?? null,
        checkOut: checkOut ?? null,
        status: input.status,
        notes: input.notes?.trim() || null
      },
      create: {
        employeeId: input.employeeId,
        date,
        checkIn: checkIn ?? null,
        checkOut: checkOut ?? null,
        status: input.status,
        notes: input.notes?.trim() || null
      }
    });
  });
}

export async function getDailyAttendanceReport(date: Date, departmentCode?: string) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));

  const employees = await prisma.employee.findMany({
    where: departmentCode ? { department: { code: departmentCode } } : {},
    include: {
      department: true,
      attendances: {
        where: {
          date: {
            gte: start,
            lt: end
          }
        }
      }
    }
  });

  const report = employees.map((emp) => {
    const record = emp.attendances[0] || null;
    return {
      employeeId: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      departmentName: emp.department.name,
      departmentCode: emp.department.code,
      status: record ? record.status : AttendanceStatus.ABSENT,
      checkIn: record ? record.checkIn : null,
      checkOut: record ? record.checkOut : null,
      notes: record ? record.notes : null
    };
  });

  const statusCounts = {
    PRESENT: report.filter((r) => r.status === "PRESENT").length,
    ABSENT: report.filter((r) => r.status === "ABSENT").length,
    LATE: report.filter((r) => r.status === "LATE").length,
    HALF_DAY: report.filter((r) => r.status === "HALF_DAY").length,
    WORK_FROM_HOME: report.filter((r) => r.status === "WORK_FROM_HOME").length
  };

  return {
    date,
    report,
    statusCounts
  };
}

export async function getMonthlyAttendancePercentageReport(monthStr: string, departmentCode?: string) {
  const match = monthStr.match(/^(\d{4})-(\d{2})$/);
  const now = new Date();
  const year = match ? Number(match[1]) : now.getFullYear();
  const monthIndex = match ? Number(match[2]) - 1 : now.getMonth();

  // Temporary cleanup of auto-marked absences
  await prisma.attendance.deleteMany({
    where: { notes: "Auto-marked absent" }
  });

  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));

  const employees = await prisma.employee.findMany({
    where: departmentCode ? { department: { code: departmentCode } } : {},
    include: {
      department: true,
      attendances: {
        where: {
          date: {
            gte: start,
            lt: end
          }
        }
      }
    }
  });

  // Calculate unique days in month that have any attendance marks
  const uniqueMarkedDays = await prisma.attendance.findMany({
    where: {
      date: {
        gte: start,
        lt: end
      }
    },
    select: { date: true },
    distinct: ["date"]
  });
  const markedDaysCount = uniqueMarkedDays.length;

  const report = employees.map((emp) => {
    const records = emp.attendances;
    const presentDays = records.filter((r) => r.status === "PRESENT" || r.status === "WORK_FROM_HOME" || r.status === "LATE").length;
    const halfDays = records.filter((r) => r.status === "HALF_DAY").length;
    const attendedCount = presentDays + halfDays * 0.5;

    const percentage = markedDaysCount > 0 ? Math.round((attendedCount / markedDaysCount) * 100) : 0;

    return {
      employeeId: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      departmentName: emp.department.name,
      departmentCode: emp.department.code,
      email: emp.email,
      jobTitle: emp.jobTitle,
      presentCount: presentDays,
      halfDayCount: halfDays,
      absentCount: records.filter((r) => r.status === "ABSENT").length,
      percentage
    };
  });

  return {
    month: monthStr,
    markedDaysCount,
    report
  };
}

