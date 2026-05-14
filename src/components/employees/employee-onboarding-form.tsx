"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { createEmployeeProfile, type EmployeeActionState } from "@/actions/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { departments } from "@/lib/constants";
import { employeeProfileSchema } from "@/lib/validators";

const initialState: EmployeeActionState = {
  ok: false,
  message: ""
};

type EmployeeProfileFormFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  departmentCode: (typeof departments)[number]["code"];
};

function getError(clientError?: { message?: string }, serverError?: string[]) {
  return clientError?.message ?? serverError?.[0];
}

export function EmployeeOnboardingForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [state, setState] = useState<EmployeeActionState>(initialState);
  const { toast } = useToast();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<EmployeeProfileFormFields>({
    resolver: zodResolver(employeeProfileSchema) as unknown as Resolver<EmployeeProfileFormFields>,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: defaultEmail,
      phone: "",
      role: "",
      departmentCode: "ENGINEERING"
    }
  });

  async function onSubmit(values: EmployeeProfileFormFields) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value));
    try {
      const result = await createEmployeeProfile(initialState, formData);
      setState(result);
      toast({
        variant: result.ok ? "success" : "error",
        title: result.ok ? "Profile created" : "Profile not created",
        description: result.message
      });
      if (result.ok && result.employeeId) {
        router.push(`/employees/${result.employeeId}`);
        router.refresh();
      }
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
      <div className="grid gap-2 lg:col-span-6">
        <Label htmlFor="firstName">First name</Label>
        <Input id="firstName" placeholder="Aarav" aria-invalid={Boolean(errors.firstName)} {...register("firstName")} />
        {getError(errors.firstName, state.errors?.firstName) ? <p className="text-xs text-destructive">{getError(errors.firstName, state.errors?.firstName)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-6">
        <Label htmlFor="lastName">Last name</Label>
        <Input id="lastName" placeholder="Mehta" aria-invalid={Boolean(errors.lastName)} {...register("lastName")} />
        {getError(errors.lastName, state.errors?.lastName) ? <p className="text-xs text-destructive">{getError(errors.lastName, state.errors?.lastName)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-6">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="name@company.com" aria-invalid={Boolean(errors.email)} {...register("email")} />
        {getError(errors.email, state.errors?.email) ? <p className="text-xs text-destructive">{getError(errors.email, state.errors?.email)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-6">
        <Label htmlFor="phone">Mobile number</Label>
        <Input id="phone" inputMode="numeric" maxLength={10} placeholder="9876543210" aria-invalid={Boolean(errors.phone)} {...register("phone")} />
        {getError(errors.phone, state.errors?.phone) ? <p className="text-xs text-destructive">{getError(errors.phone, state.errors?.phone)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-6">
        <Label htmlFor="role">Role</Label>
        <Input id="role" placeholder="Product Manager" aria-invalid={Boolean(errors.role)} {...register("role")} />
        {getError(errors.role, state.errors?.role) ? <p className="text-xs text-destructive">{getError(errors.role, state.errors?.role)}</p> : null}
      </div>
      <div className="grid gap-2 lg:col-span-6">
        <Label htmlFor="departmentCode">Department</Label>
        <Select id="departmentCode" {...register("departmentCode")}>
          {departments.map((department) => (
            <option key={department.code} value={department.code}>
              {department.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:col-span-12">
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Create my profile
        </Button>
        {state.message ? <p className={state.ok ? "text-sm text-emerald-700 dark:text-emerald-300" : "text-sm text-destructive"}>{state.message}</p> : null}
      </div>
    </form>
  );
}
