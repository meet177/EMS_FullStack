"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/authz";
import { getCurrentUser } from "@/lib/authz";
import { createEmployeeProfileForUser, createEmployeeRecord, deleteEmployeeRecord, updateEmployeeRecord, updateEmployeeSalaryRecord } from "@/lib/db/employees";
import { getActionErrorCode, getActionErrorMessage, type ActionErrorCode } from "@/lib/errors";
import { employeeProfileSchema, employeeSchema } from "@/lib/validators";

export type EmployeeActionState = {
  ok: boolean;
  message: string;
  code?: ActionErrorCode;
  errors?: Record<string, string[] | undefined>;
  employeeId?: string;
};

export async function createEmployeeProfile(_: EmployeeActionState, formData: FormData): Promise<EmployeeActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, code: "AUTH", message: "Please sign in through the employee portal first." };
  }

  if (user.role !== "EMPLOYEE") {
    return { ok: false, code: "AUTH", message: "Employee profile setup is only for employee accounts." };
  }

  if (user.employee?.id) {
    return { ok: true, message: "Employee profile already exists.", employeeId: user.employee.id };
  }

  const parsed = employeeProfileSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    const employee = await createEmployeeProfileForUser(user.id, parsed.data);
    revalidatePath("/employee/onboarding");
    revalidatePath(`/employees/${employee.id}`);
    revalidatePath("/attendance");
    revalidatePath("/leave-requests");

    return { ok: true, message: "Employee profile created.", employeeId: employee.id };
  } catch (error) {
    if (getActionErrorCode(error) === "CONFLICT") {
      return { ok: false, code: "CONFLICT", message: "An employee with this email or user account already exists." };
    }

    return { ok: false, code: getActionErrorCode(error), message: getActionErrorMessage(error, "Could not create employee profile. Please try again.") };
  }
}

export async function createEmployee(_: EmployeeActionState, formData: FormData): Promise<EmployeeActionState> {
  await requireAdmin();

  const parsed = employeeSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await createEmployeeRecord(parsed.data);
    revalidatePath("/employees");
    revalidatePath("/dashboard");

    return { ok: true, message: "Employee added." };
  } catch (error) {
    if (getActionErrorCode(error) === "CONFLICT") {
      return { ok: false, code: "CONFLICT", message: "An employee with this email already exists." };
    }

    return { ok: false, code: getActionErrorCode(error), message: getActionErrorMessage(error, "Could not add employee. Please try again.") };
  }
}

export async function updateEmployee(_: EmployeeActionState, formData: FormData): Promise<EmployeeActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = employeeSchema.safeParse(Object.fromEntries(formData));

  if (!id) {
    return { ok: false, code: "VALIDATION", message: "Employee id is missing." };
  }

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await updateEmployeeRecord(id, parsed.data);
    revalidatePath("/employees");
    revalidatePath(`/employees/${id}`);
    revalidatePath("/dashboard");

    return { ok: true, message: "Employee updated." };
  } catch (error) {
    if (getActionErrorCode(error) === "CONFLICT") {
      return { ok: false, code: "CONFLICT", message: "An employee with this email already exists." };
    }

    return { ok: false, code: getActionErrorCode(error), message: getActionErrorMessage(error, "Could not update employee. Please try again.") };
  }
}

export async function updateEmployeeSalary(formData: FormData): Promise<EmployeeActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const salaryValue = String(formData.get("salary") ?? "").trim();

  if (!id) {
    return { ok: false, code: "VALIDATION", message: "Employee id is missing." };
  }

  if (!salaryValue) {
    return { ok: false, code: "VALIDATION", message: "Enter a salary amount." };
  }

  const salary = Number(salaryValue);

  if (!Number.isInteger(salary) || salary <= 0) {
    return { ok: false, code: "VALIDATION", message: "Enter a valid positive salary amount." };
  }

  try {
    await updateEmployeeSalaryRecord(id, salary);
    revalidatePath("/employees");
    revalidatePath(`/employees/${id}`);
    revalidatePath(`/employees/${id}/edit`);
    revalidatePath("/dashboard");

    return { ok: true, message: "Salary updated." };
  } catch (error) {
    return { ok: false, code: getActionErrorCode(error), message: getActionErrorMessage(error, "Could not update salary. Please try again.") };
  }
}

export async function deleteEmployee(formData: FormData): Promise<EmployeeActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) return { ok: false, code: "VALIDATION", message: "Employee id is missing." };

  try {
    await deleteEmployeeRecord(id);
  } catch (error) {
    return { ok: false, code: getActionErrorCode(error), message: getActionErrorMessage(error, "Could not delete employee. Please try again.") };
  }
  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
  revalidatePath("/dashboard");

  return { ok: true, message: "Employee deleted." };
}
