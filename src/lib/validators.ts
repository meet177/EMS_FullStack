import { z } from "zod";

import { attendanceStatuses, departmentCodes, employeeStatuses, leaveTypes } from "@/lib/constants";

const mobileNumberSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number.");

const optionalMobileNumberSchema = mobileNumberSchema.optional().or(z.literal("").transform(() => undefined));

function startOfToday() {
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  todayUTC.setUTCDate(todayUTC.getUTCDate() - 1);
  return todayUTC;
}

export const employeeSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters."),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: optionalMobileNumberSchema,
  role: z.string().trim().min(2, "Role is required."),
  departmentCode: z.enum(departmentCodes),
  status: z.enum(employeeStatuses),
  salary: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  joinedAt: z.coerce.date()
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

export const employeeProfileSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters."),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: mobileNumberSchema,
  role: z.string().trim().min(2, "Role is required."),
  departmentCode: z.enum(departmentCodes)
});

export type EmployeeProfileInput = z.infer<typeof employeeProfileSchema>;

export const leaveRequestSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required."),
    type: z.enum(leaveTypes),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().trim().min(8, "Reason must be at least 8 characters.").max(300, "Reason must be 300 characters or fewer.")
  })
  .refine((value) => value.startDate >= startOfToday(), {
    path: ["startDate"],
    message: "Start date cannot be in the past."
  })
  .refine((value) => value.endDate >= value.startDate, {
    path: ["endDate"],
    message: "End date must be on or after the start date."
  });

export const leaveReviewSchema = z.object({
  id: z.string().min(1, "Leave request id is required."),
  reviewNote: z.string().trim().max(300, "Review note must be 300 characters or fewer.").optional()
});

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;

export const attendanceSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required."),
    date: z.coerce.date(),
    checkIn: z.string().trim().optional(),
    checkOut: z.string().trim().optional(),
    status: z.enum(attendanceStatuses),
    notes: z.string().trim().max(300, "Notes must be 300 characters or fewer.").optional()
  })
  .refine((value) => attendanceStatuses.includes(value.status), {
    path: ["status"],
    message: "Choose a valid attendance status."
  })
  .refine(
    (value) => {
      if (!value.checkIn || !value.checkOut) return true;
      return value.checkOut >= value.checkIn;
    },
    {
      path: ["checkOut"],
      message: "Check out must be after check in."
    }
  );

export type AttendanceInput = z.infer<typeof attendanceSchema>;
