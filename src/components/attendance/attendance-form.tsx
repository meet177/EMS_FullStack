"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { markAttendance, type AttendanceActionState } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { attendanceStatuses } from "@/lib/constants";
import { titleCase } from "@/lib/utils";
import { attendanceSchema } from "@/lib/validators";

type EmployeeOption = {
  id: string;
  name: string;
};

const initialState: AttendanceActionState = {
  ok: false,
  message: ""
};

type AttendanceFormFields = {
  employeeId: string;
  date: string;
  status: (typeof attendanceStatuses)[number];
  checkIn: string;
  checkOut: string;
  notes: string;
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

export function AttendanceForm({ employees, canChooseEmployee = true }: { employees: EmployeeOption[]; canChooseEmployee?: boolean }) {
  const [state, setState] = useState<AttendanceActionState>(initialState);
  const { toast } = useToast();
  const selectedEmployee = employees[0];
  const today = getTodayInputValue();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AttendanceFormFields>({
    resolver: zodResolver(attendanceSchema) as unknown as Resolver<AttendanceFormFields>,
    defaultValues: {
      employeeId: selectedEmployee?.id ?? "",
      date: today,
      status: "PRESENT",
      checkIn: "",
      checkOut: "",
      notes: ""
    }
  });

  async function onSubmit(values: AttendanceFormFields) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value));
    formData.set("clientTimeZone", Intl.DateTimeFormat().resolvedOptions().timeZone);
    try {
      const result = await markAttendance(initialState, formData);
      setState(result);
      toast({
        variant: result.ok ? "success" : "error",
        title: result.ok ? "Attendance marked" : "Attendance not saved",
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
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          min={!canChooseEmployee ? today : undefined}
          max={!canChooseEmployee ? today : undefined}
          readOnly={!canChooseEmployee}
          aria-invalid={Boolean(errors.date)}
          {...register("date")}
        />
        {getError(errors.date, state.errors?.date) ? <p className="text-xs text-destructive">{getError(errors.date, state.errors?.date)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Label htmlFor="status">Status</Label>
        <Select id="status" aria-invalid={Boolean(errors.status)} {...register("status")}>
          {attendanceStatuses.map((status) => (
            <option key={status} value={status}>
              {titleCase(status)}
            </option>
          ))}
        </Select>
        {getError(errors.status, state.errors?.status) ? <p className="text-xs text-destructive">{getError(errors.status, state.errors?.status)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Label htmlFor="checkIn">Check in</Label>
        <Input id="checkIn" type="time" {...register("checkIn")} />
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Label htmlFor="checkOut">Check out</Label>
        <Input id="checkOut" type="time" aria-invalid={Boolean(errors.checkOut)} {...register("checkOut")} />
        {getError(errors.checkOut, state.errors?.checkOut) ? <p className="text-xs text-destructive">{getError(errors.checkOut, state.errors?.checkOut)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-12">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" placeholder="Optional notes for the day" maxLength={300} aria-invalid={Boolean(errors.notes)} {...register("notes")} />
        {getError(errors.notes, state.errors?.notes) ? <p className="text-xs text-destructive">{getError(errors.notes, state.errors?.notes)}</p> : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:col-span-12">
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || !employees.length}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
          Mark attendance
        </Button>
        {state.message ? (
          <p className={state.ok ? "text-sm text-emerald-700 dark:text-emerald-300" : "text-sm text-destructive"}>{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
