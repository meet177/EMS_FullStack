"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { submitLeaveRequest, type LeaveActionState } from "@/actions/leave-requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { leaveTypes } from "@/lib/constants";
import { titleCase } from "@/lib/utils";
import { leaveRequestSchema } from "@/lib/validators";

type EmployeeOption = {
  id: string;
  name: string;
};

const initialState: LeaveActionState = {
  ok: false,
  message: ""
};

type LeaveRequestFormFields = {
  employeeId: string;
  type: (typeof leaveTypes)[number];
  startDate: string;
  endDate: string;
  reason: string;
};

function getError(clientError?: { message?: string }, serverError?: string[]) {
  return clientError?.message ?? serverError?.[0];
}

function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function LeaveRequestForm({ employees, canChooseEmployee = true }: { employees: EmployeeOption[]; canChooseEmployee?: boolean }) {
  const [state, setState] = useState<LeaveActionState>(initialState);
  const { toast } = useToast();
  const selectedEmployee = employees[0];
  const today = getTodayInputValue();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LeaveRequestFormFields>({
    resolver: zodResolver(leaveRequestSchema) as unknown as Resolver<LeaveRequestFormFields>,
    defaultValues: {
      employeeId: selectedEmployee?.id ?? "",
      type: "CASUAL",
      startDate: today,
      endDate: today,
      reason: ""
    }
  });

  async function onSubmit(values: LeaveRequestFormFields) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value));
    try {
      const result = await submitLeaveRequest(initialState, formData);
      setState(result);
      toast({
        variant: result.ok ? "success" : "error",
        title: result.ok ? "Leave request submitted" : "Leave request not submitted",
        description: result.message
      });
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
      {canChooseEmployee ? (
        <div className="grid gap-2 lg:col-span-3">
          <Label htmlFor="employeeId">Employee</Label>
          <Select id="employeeId" disabled={!employees.length} aria-invalid={Boolean(errors.employeeId)} {...register("employeeId")}>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </Select>
          {getError(errors.employeeId, state.errors?.employeeId) ? <p className="text-xs text-destructive">{getError(errors.employeeId, state.errors?.employeeId)}</p> : null}
        </div>
      ) : (
        <div className="grid gap-2 lg:col-span-3">
          <Label htmlFor="employeeName">Employee</Label>
          <Input id="employeeName" value={selectedEmployee?.name ?? "No employee linked"} disabled />
          <input type="hidden" {...register("employeeId")} />
          {getError(errors.employeeId, state.errors?.employeeId) ? <p className="text-xs text-destructive">{getError(errors.employeeId, state.errors?.employeeId)}</p> : null}
        </div>
      )}
      <div className="grid gap-2 lg:col-span-2">
        <Label htmlFor="type">Type</Label>
        <Select id="type" {...register("type")}>
          {leaveTypes.map((type) => (
            <option key={type} value={type}>
              {titleCase(type)}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Label htmlFor="startDate">Start date</Label>
        <Input id="startDate" type="date" min={today} aria-invalid={Boolean(errors.startDate)} {...register("startDate")} />
        {getError(errors.startDate, state.errors?.startDate) ? <p className="text-xs text-destructive">{getError(errors.startDate, state.errors?.startDate)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Label htmlFor="endDate">End date</Label>
        <Input id="endDate" type="date" min={today} aria-invalid={Boolean(errors.endDate)} {...register("endDate")} />
        {getError(errors.endDate, state.errors?.endDate) ? <p className="text-xs text-destructive">{getError(errors.endDate, state.errors?.endDate)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-3">
        <Label htmlFor="reason">Reason</Label>
        <Input id="reason" placeholder="Family event, illness, travel..." aria-invalid={Boolean(errors.reason)} {...register("reason")} />
        {getError(errors.reason, state.errors?.reason) ? <p className="text-xs text-destructive">{getError(errors.reason, state.errors?.reason)}</p> : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:col-span-12">
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || !employees.length}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit request
        </Button>
        {state.message ? (
          <p className={state.ok ? "text-sm text-emerald-700 dark:text-emerald-300" : "text-sm text-destructive"}>{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
