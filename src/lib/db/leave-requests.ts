import { EmployeeStatus, LeaveStatus, type LeaveType } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { syncEmployeeStatuses } from "./employees";

type LeaveRequestInput = {
  employeeId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
};

export class LeaveRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeaveRequestError";
  }
}

export async function getLeaveRequestsForEmployee(employeeId: string) {
  return prisma.leaveRequest.findMany({
    where: { employeeId },
    include: {
      employee: {
        include: { department: true }
      },
      reviewer: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export function getLeaveMonthRange(month?: string) {
  const match = month?.match(/^(\d{4})-(\d{2})$/);
  const now = new Date();
  const year = match ? Number(match[1]) : now.getFullYear();
  const monthIndex = match ? Number(match[2]) - 1 : now.getMonth();
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));

  return { start, end, label: `${year}-${String(monthIndex + 1).padStart(2, "0")}` };
}

export function getLeaveDaysInMonth(startDate: Date, endDate: Date, monthDate: Date = new Date()) {
  const startOfCurrentMonth = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
  const endOfCurrentMonth = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  const start = startDate < startOfCurrentMonth ? startOfCurrentMonth : startDate;
  const end = endDate > endOfCurrentMonth ? endOfCurrentMonth : endDate;

  if (start > end) return 0;

  const startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  const days = Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return days;
}

export function getLeaveDaysInYear(startDate: Date, endDate: Date, year: number) {
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year + 1, 0, 0, 23, 59, 59, 999));

  const start = startDate < startOfYear ? startOfYear : startDate;
  const end = endDate > endOfYear ? endOfYear : endDate;

  if (start > end) return 0;

  const startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  return Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export async function getApprovedLeaveDaysForEmployeeInMonth(employeeId: string, month?: string) {
  const range = getLeaveMonthRange(month);
  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: {
      employeeId,
      status: LeaveStatus.APPROVED,
      startDate: { lt: range.end },
      endDate: { gte: range.start }
    },
    select: {
      startDate: true,
      endDate: true
    }
  });

  return approvedLeaves.reduce((total, leave) => total + getLeaveDaysInMonth(leave.startDate, leave.endDate, range.start), 0);
}

export async function getYearlyApprovedLeaveDaysForEmployee(employeeId: string, year: number) {
  const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
  const daysByMonth = await Promise.all(months.map((month) => getApprovedLeaveDaysForEmployeeInMonth(employeeId, month)));

  return months.map((month, index) => ({
    month,
    days: daysByMonth[index]
  }));
}

export async function getLeaveRequests() {
  const now = new Date();
  const startOfCurrentYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const endOfCurrentYear = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));

  const requests = await prisma.leaveRequest.findMany({
    include: {
      employee: {
        include: {
          department: true,
          leaveRequests: {
            where: {
              status: LeaveStatus.APPROVED,
              startDate: { lt: endOfCurrentYear },
              endDate: { gte: startOfCurrentYear }
            }
          }
        }
      },
      reviewer: true
    },
    orderBy: [{ startDate: "desc" }, { endDate: "desc" }, { createdAt: "desc" }]
  });

  return requests.map((req) => {
    let approvedLeavesThisYear = 0;
    if (req.employee && req.employee.leaveRequests) {
      req.employee.leaveRequests.forEach((approvedLeave) => {
        approvedLeavesThisYear += getLeaveDaysInYear(approvedLeave.startDate, approvedLeave.endDate, now.getUTCFullYear());
      });
    }
    return {
      ...req,
      employee: req.employee ? {
        ...req.employee,
        approvedLeavesThisYear
      } : null
    };
  }) as any;
}

export async function createLeaveRequest(input: LeaveRequestInput) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  today.setUTCDate(today.getUTCDate() - 1); // Yesterday UTC to allow timezone offset difference

  if (input.startDate < today) {
    throw new LeaveRequestError("Leave requests can only start from today onwards.");
  }

  if (input.endDate < input.startDate) {
    throw new LeaveRequestError("End date must be after the start date.");
  }

  return prisma.$transaction(async (tx) => {
    const employee = await tx.employee.findUnique({
      where: { id: input.employeeId },
      select: { id: true, status: true }
    });

    if (!employee) {
      throw new LeaveRequestError("Select a valid employee.");
    }

    const overlappingRequest = await tx.leaveRequest.findFirst({
      where: {
        employeeId: input.employeeId,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        startDate: { lte: input.endDate },
        endDate: { gte: input.startDate }
      },
      select: { id: true }
    });

    if (overlappingRequest) {
      throw new LeaveRequestError("This employee already has a pending or approved leave request in that date range.");
    }

    return tx.leaveRequest.create({ data: input });
  });
}

export async function reviewLeaveRequest(id: string, reviewerId: string | undefined, status: LeaveStatus, reviewNote?: string) {
  if (status !== LeaveStatus.APPROVED && status !== LeaveStatus.REJECTED) {
    throw new LeaveRequestError("Leave requests can only be approved or rejected.");
  }

  return prisma.$transaction(async (tx) => {
    const request = await tx.leaveRequest.findUnique({
      where: { id },
      select: { id: true, employeeId: true, status: true }
    });

    if (!request) {
      throw new LeaveRequestError("Leave request not found.");
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new LeaveRequestError("Only pending leave requests can be reviewed.");
    }

    const reviewedRequest = await tx.leaveRequest.update({
      where: { id },
      data: {
        reviewerId,
        status,
        reviewNote: reviewNote?.trim() || null,
        reviewedAt: new Date()
      }
    });

    await syncEmployeeStatuses(tx);

    return reviewedRequest;
  });
}
