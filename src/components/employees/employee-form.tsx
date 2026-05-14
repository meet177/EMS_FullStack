"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { createEmployee, updateEmployee, type EmployeeActionState } from "@/actions/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { departments, employeeStatuses } from "@/lib/constants";
import { titleCase } from "@/lib/utils";
import { employeeSchema } from "@/lib/validators";

const initialState: EmployeeActionState = {
  ok: false,
  message: ""
};

type EmployeeFormValue = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string;
  status: string;
  salary: number | null;
  joinedAt: Date;
  department: {
    code: string;
  };
};

type EmployeeFormFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  departmentCode: (typeof departments)[number]["code"];
  status: (typeof employeeStatuses)[number];
  salary: string;
  joinedAt: string;
};

function getError(clientError?: { message?: string }, serverError?: string[]) {
  return clientError?.message ?? serverError?.[0];
}

export function EmployeeForm({ employee, mode = "create" }: { employee?: EmployeeFormValue; mode?: "create" | "edit" }) {
  const [state, setState] = useState<EmployeeActionState>(initialState);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<EmployeeFormFields>({
    resolver: zodResolver(employeeSchema) as unknown as Resolver<EmployeeFormFields>,
    defaultValues: {
      firstName: employee?.firstName ?? "",
      lastName: employee?.lastName ?? "",
      email: employee?.email ?? "",
      phone: employee?.phone ?? "",
      role: employee?.jobTitle ?? "",
      departmentCode: (employee?.department.code ?? "ENGINEERING") as EmployeeFormFields["departmentCode"],
      status: (employee?.status as EmployeeFormFields["status"]) ?? "ACTIVE",
      salary: employee?.salary ? String(employee.salary) : "",
      joinedAt: (employee?.joinedAt ?? new Date()).toISOString().slice(0, 10)
    }
  });
  const action = mode === "create" ? createEmployee : updateEmployee;

  async function onSubmit(values: EmployeeFormFields) {
    const formData = new FormData();
    if (employee) formData.set("id", employee.id);
    Object.entries(values).forEach(([key, value]) => formData.set(key, value));
    try {
      const result = await action(initialState, formData);
      setState(result);
      toast({
        variant: result.ok ? "success" : "error",
        title: result.ok ? (mode === "create" ? "Employee added" : "Employee updated") : "Employee not saved",
        description: result.message
      });
      if (result.ok && mode === "create") reset();
    } catch {
      const result = { ok: false, message: "The request could not be completed. Please check your connection and try again." };
      setState(result);
      toast({
        variant: "error",
        title: "Request failed",
        description: result.message
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 lg:grid-cols-12">
      <div className="grid gap-2 lg:col-span-3">
        <Label htmlFor="firstName">First name</Label>
        <Input id="firstName" placeholder="Aarav" aria-invalid={Boolean(errors.firstName)} {...register("firstName")} />
        {getError(errors.firstName, state.errors?.firstName) ? <p className="text-xs text-destructive">{getError(errors.firstName, state.errors?.firstName)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-3">
        <Label htmlFor="lastName">Last name</Label>
        <Input id="lastName" placeholder="Mehta" aria-invalid={Boolean(errors.lastName)} {...register("lastName")} />
        {getError(errors.lastName, state.errors?.lastName) ? <p className="text-xs text-destructive">{getError(errors.lastName, state.errors?.lastName)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-3">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="name@company.com" aria-invalid={Boolean(errors.email)} {...register("email")} />
        {getError(errors.email, state.errors?.email) ? <p className="text-xs text-destructive">{getError(errors.email, state.errors?.email)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-3">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" inputMode="numeric" maxLength={10} placeholder="9876543210" aria-invalid={Boolean(errors.phone)} {...register("phone")} />
        {getError(errors.phone, state.errors?.phone) ? <p className="text-xs text-destructive">{getError(errors.phone, state.errors?.phone)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-3">
        <Label htmlFor="role">Role</Label>
        <Input id="role" placeholder="Product Manager" aria-invalid={Boolean(errors.role)} {...register("role")} />
        {getError(errors.role, state.errors?.role) ? <p className="text-xs text-destructive">{getError(errors.role, state.errors?.role)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-3">
        <Label htmlFor="departmentCode">Department</Label>
        <Select id="departmentCode" {...register("departmentCode")}>
          {departments.map((department) => (
            <option key={department.code} value={department.code}>
              {department.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Label htmlFor="status">Status</Label>
        <Select id="status" {...register("status")}>
          {employeeStatuses.map((status) => (
            <option key={status} value={status}>
              {titleCase(status)}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Label htmlFor="salary">Salary</Label>
        <Input id="salary" type="number" min="0" placeholder="1800000" aria-invalid={Boolean(errors.salary)} {...register("salary")} />
        {getError(errors.salary, state.errors?.salary) ? <p className="text-xs text-destructive">{getError(errors.salary, state.errors?.salary)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Label htmlFor="joinedAt">Joined</Label>
        <Input id="joinedAt" type="date" aria-invalid={Boolean(errors.joinedAt)} {...register("joinedAt")} />
        {getError(errors.joinedAt, state.errors?.joinedAt) ? <p className="text-xs text-destructive">{getError(errors.joinedAt, state.errors?.joinedAt)}</p> : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end lg:col-span-12">
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {mode === "create" ? "Add employee" : "Save changes"}
        </Button>
        {state.message ? (
          <p className={state.ok ? "text-sm text-emerald-700 dark:text-emerald-300" : "text-sm text-destructive"}>{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
