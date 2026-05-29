import { ArrowLeft, CalendarDays, Mail, Pencil, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeSalaryForm } from "@/components/employees/employee-salary-form";
import { requireEmployeeProfileAccess } from "@/lib/authz";
import { getEmployeeById } from "@/lib/db/employees";
import { formatCurrency, titleCase } from "@/lib/utils";



async function getEmployee(id: string) {
  return await getEmployeeById(id);
}

export default async function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { isAdmin } = await requireEmployeeProfileAccess(id);
  const employee = await getEmployee(id);

  if (!employee) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Button asChild variant="ghost" className="-ml-3 mb-2">
            <Link href={isAdmin ? "/employees" : "/attendance"}>
              <ArrowLeft className="h-4 w-4" />
              {isAdmin ? "Employees" : "Attendance"}
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{employee.jobTitle}</p>
        </div>
        {isAdmin ? (
          <Button asChild>
            <Link href={`/employees/${employee.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit employee
            </Link>
          </Button>
        ) : null}
      </div>



      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Core employee information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              <span>{employee.department.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{employee.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{employee.phone ?? "Not set"}</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>{employee.joinedAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment</CardTitle>
            <CardDescription>Status, salary, and recent activity.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="mt-2" variant={employee.status === "ACTIVE" ? "success" : employee.status === "ON_LEAVE" ? "warning" : "muted"}>
                {titleCase(employee.status)}
              </Badge>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Salary</p>
              {isAdmin ? (
                <div className="mt-3">
                  <EmployeeSalaryForm employeeId={employee.id} salary={employee.salary} />
                </div>
              ) : (
                <p className="mt-2 text-lg font-semibold">{formatCurrency(employee.salary)}</p>
              )}
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="mt-2 text-lg font-semibold">{employee.department.name}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
