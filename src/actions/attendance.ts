"use server";

import { revalidatePath } from "next/cache";

import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/authz";
import { AttendanceError, upsertAttendance } from "@/lib/db/attendance";
import { isClerkConfigured } from "@/lib/env";
import { getActionErrorCode, getActionErrorMessage, type ActionErrorCode } from "@/lib/errors";
import { attendanceSchema } from "@/lib/validators";

export type AttendanceActionState = {
  ok: boolean;
  message: string;
  code?: ActionErrorCode;
  errors?: Record<string, string[] | undefined>;
};

async function getSessionUser() {
  return getCurrentUser();
}

function parseTime(time?: string) {
  if (!time) return undefined;

  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return undefined;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export async function markAttendance(_: AttendanceActionState, formData: FormData): Promise<AttendanceActionState> {
  const user = await getSessionUser();
  const parsed = attendanceSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const clientTimeZone = String(formData.get("clientTimeZone") ?? "UTC");

  if (isClerkConfigured() && user?.role !== UserRole.ADMIN && !user?.employee?.id) {
    return { ok: false, code: "AUTH", message: "Your user account is not linked to an employee record." };
  }

  if (isClerkConfigured() && user?.role !== UserRole.ADMIN) {
    const now = new Date();
    const clientLocalDateString = now.toLocaleDateString("en-US", { timeZone: clientTimeZone });
    const submittedDateString = parsed.data.date.toLocaleDateString("en-US", { timeZone: "UTC" });

    if (submittedDateString !== clientLocalDateString) {
      return { ok: false, code: "VALIDATION", message: "Employees can only mark attendance for today." };
    }
  }

  try {
    await upsertAttendance({
      employeeId: user?.role === UserRole.ADMIN ? parsed.data.employeeId : user?.employee?.id ?? parsed.data.employeeId,
      date: parsed.data.date,
      checkIn: parseTime(parsed.data.checkIn),
      checkOut: parseTime(parsed.data.checkOut),
      status: parsed.data.status,
      notes: parsed.data.notes,
      clientTimeZone
    });

    revalidatePath("/attendance");
    revalidatePath("/dashboard");
    revalidatePath("/employees");

    return { ok: true, message: "Attendance marked." };
  } catch (error) {
    return {
      ok: false,
      code: error instanceof AttendanceError ? "VALIDATION" : getActionErrorCode(error),
      message: error instanceof AttendanceError ? error.message : getActionErrorMessage(error, "Could not mark attendance.")
    };
  }
}
