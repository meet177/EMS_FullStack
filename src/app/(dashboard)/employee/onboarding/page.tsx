import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";

import { EmployeeOnboardingForm } from "@/components/employees/employee-onboarding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessContext } from "@/lib/authz";
import { isClerkConfigured } from "@/lib/env";



export default async function EmployeeOnboardingPage() {
  const { user, isAdmin, employeeId } = await getAccessContext();

  if (isAdmin) redirect("/employee/sign-in?employeeOnly=1");
  if (employeeId) redirect(`/employees/${employeeId}`);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">Create employee profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Complete these details once to activate your employee record.</p>
        </div>
      </div>

      {!isClerkConfigured() && !user ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">
            Authentication is not configured. Sign in through the portal to create a profile.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Employee details</CardTitle>
            <CardDescription>Use a valid email address and a 10-digit Indian mobile number.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeOnboardingForm defaultEmail={user?.email ?? ""} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
