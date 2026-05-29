import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmployeeForm } from "@/components/employees/employee-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/authz";
import { getEmployeeById } from "@/lib/db/employees";



async function getEmployee(id: string) {
  return await getEmployeeById(id);
}

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  const employee = await getEmployee(id);

  if (!employee) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" className="-ml-3 mb-2">
          <Link href={`/employees/${employee.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Employee details
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">Edit employee</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update profile, department, status, salary, and joining information.
        </p>
      </div>



      <Card>
        <CardHeader>
          <CardTitle>
            {employee.firstName} {employee.lastName}
          </CardTitle>
          <CardDescription>
            Changes are saved with a server action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm mode="edit" employee={employee} />
        </CardContent>
      </Card>
    </div>
  );
}
