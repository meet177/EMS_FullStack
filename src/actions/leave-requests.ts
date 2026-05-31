"use server";

import { LeaveStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/authz";
import { createLeaveRequest, LeaveRequestError, reviewLeaveRequest } from "@/lib/db/leave-requests";
import { isClerkConfigured } from "@/lib/env";
import { getActionErrorCode, getActionErrorMessage, type ActionErrorCode } from "@/lib/errors";
import { leaveRequestSchema, leaveReviewSchema } from "@/lib/validators";

export type LeaveActionState = {
  ok: boolean;
  message: string;
  code?: ActionErrorCode;
  errors?: Record<string, string[] | undefined>;
};

async function getSessionUser() {
  return getCurrentUser();
}

async function assertAdmin() {
  const user = await getSessionUser();

  if (user?.role !== UserRole.ADMIN) {
    return null;
  }

  return user;
}

export async function submitLeaveRequest(_: LeaveActionState, formData: FormData): Promise<LeaveActionState> {
  const user = await getSessionUser();
  const parsed = leaveRequestSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  if (isClerkConfigured() && user?.role !== UserRole.ADMIN && !user?.employee?.id) {
    return { ok: false, code: "AUTH", message: "Your user account is not linked to an employee record." };
  }

  try {
    await createLeaveRequest({
      ...parsed.data,
      employeeId: user?.role === UserRole.ADMIN ? parsed.data.employeeId : user?.employee?.id ?? parsed.data.employeeId
    });
    revalidatePath("/leave-requests");
    revalidatePath("/dashboard");

    return { ok: true, message: "Leave request submitted." };
  } catch (error) {
    return {
      ok: false,
      code: error instanceof LeaveRequestError ? "VALIDATION" : getActionErrorCode(error),
      message: error instanceof LeaveRequestError ? error.message : getActionErrorMessage(error, "Could not submit leave request.")
    };
  }
}

export async function approveLeaveRequest(formData: FormData): Promise<LeaveActionState> {
  const user = await assertAdmin();
  if (!user) return { ok: false, code: "AUTH", message: "Only admins can review leave requests." };
  const parsed = leaveReviewSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) return { ok: false, code: "VALIDATION", message: "Please check the review note." };

  try {
    await reviewLeaveRequest(parsed.data.id, user?.id, LeaveStatus.APPROVED, parsed.data.reviewNote);
    revalidatePath("/leave-requests");
    revalidatePath("/employees");
    revalidatePath("/dashboard");
    return { ok: true, message: "Leave request approved." };
  } catch (error) {
    if (error instanceof LeaveRequestError) {
      return { ok: false, code: "VALIDATION", message: error.message };
    }
    return { ok: false, code: getActionErrorCode(error), message: getActionErrorMessage(error, "Could not approve leave request.") };
  }
}

export async function rejectLeaveRequest(formData: FormData): Promise<LeaveActionState> {
  const user = await assertAdmin();
  if (!user) return { ok: false, code: "AUTH", message: "Only admins can review leave requests." };
  const parsed = leaveReviewSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) return { ok: false, code: "VALIDATION", message: "Please check the review note." };

  try {
    await reviewLeaveRequest(parsed.data.id, user?.id, LeaveStatus.REJECTED, parsed.data.reviewNote);
    revalidatePath("/leave-requests");
    revalidatePath("/employees");
    revalidatePath("/dashboard");
    return { ok: true, message: "Leave request rejected." };
  } catch (error) {
    if (error instanceof LeaveRequestError) {
      return { ok: false, code: "VALIDATION", message: error.message };
    }
    return { ok: false, code: getActionErrorCode(error), message: getActionErrorMessage(error, "Could not reject leave request.") };
  }
}
