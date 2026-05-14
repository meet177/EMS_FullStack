"use client";

import { Loader2, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";

import { updateEmployeeSalary } from "@/actions/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export function EmployeeSalaryForm({ employeeId, salary }: { employeeId: string; salary: number | null }) {
  const [value, setValue] = useState(salary ? String(salary) : "");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();
    formData.set("id", employeeId);
    formData.set("salary", value);

    startTransition(async () => {
      try {
        const result = await updateEmployeeSalary(formData);
        setMessage(result.message);
        toast({
          variant: result.ok ? "success" : "error",
          title: result.ok ? "Salary updated" : "Salary not updated",
          description: result.message
        });
      } catch {
        const description = "The salary could not be updated. Please check your connection and try again.";
        setMessage(description);
        toast({
          variant: "error",
          title: "Request failed",
          description
        });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid gap-2">
        <Label htmlFor="salary">Salary</Label>
        <Input
          id="salary"
          name="salary"
          type="number"
          min="1"
          inputMode="numeric"
          placeholder="1800000"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save salary
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </form>
  );
}
