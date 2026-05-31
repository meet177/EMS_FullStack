import { CalendarClock, Send } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LeaveRequestForm } from "@/components/leave-requests/leave-request-form";
import { LeaveReviewActions } from "@/components/leave-requests/leave-review-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getApprovedLeaveDaysForEmployeeInMonth,
  getLeaveRequests,
  getLeaveRequestsForEmployee,
  getYearlyApprovedLeaveDaysForEmployee
} from "@/lib/db/leave-requests";
import { getAccessContext } from "@/lib/authz";
import { isClerkConfigured } from "@/lib/env";
import { titleCase } from "@/lib/utils";


type LeaveFilter = "PENDING" | "APPROVED" | "REJECTED";

type LeaveRequestsPageProps = {
  searchParams?: Promise<{
    status?: string;
    month?: string;
  }>;
};

function leaveBadgeVariant(status: string) {
  if (status === "APPROVED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "REJECTED") return "destructive";
  return "muted";
}

async function getLeavePageData(month?: string) {
  const { user, isAdmin } = await getAccessContext();
  if (!user) redirect("/sign-in");

  const clerkEnabled = isClerkConfigured();
  if (clerkEnabled && !isAdmin && !user?.employee?.id) redirect("/employee/onboarding");

  if (isAdmin) {
    const leaveRequests = await getLeaveRequests();
    return { employees: [], leaveRequests, isAdmin };
  }

  const employee = user?.employee;
  const selectedYear = Number((month ?? new Date().toISOString().slice(0, 7)).slice(0, 4));
  const [leaveRequests, monthlyApprovedLeaves, yearlyApprovedLeaves] = employee?.id
    ? await Promise.all([
        getLeaveRequestsForEmployee(employee.id),
        getApprovedLeaveDaysForEmployeeInMonth(employee.id, month),
        getYearlyApprovedLeaveDaysForEmployee(employee.id, selectedYear)
      ])
    : [[], 0, []];
  return { employees: employee ? [employee] : [], leaveRequests, monthlyApprovedLeaves, yearlyApprovedLeaves, isAdmin };
}

function getLeaveFilter(value?: string): LeaveFilter {
  return value === "APPROVED" || value === "REJECTED" ? value : "PENDING";
}

export default async function LeaveRequestsPage({ searchParams }: LeaveRequestsPageProps) {
  const params = (await searchParams) ?? {};
  const selectedStatus = getLeaveFilter(params.status);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const selectedMonth = params.month ?? currentMonth;
  const { employees, leaveRequests, monthlyApprovedLeaves, yearlyApprovedLeaves, isAdmin } = await getLeavePageData(selectedMonth);
  const visibleLeaveRequests =
    isAdmin ? leaveRequests.filter((request: any) => request.status === selectedStatus) : leaveRequests;
  const pendingCount = leaveRequests.filter((request: any) => request.status === "PENDING").length;
  const approvedCount = leaveRequests.filter((request: any) => request.status === "APPROVED").length;
  const rejectedCount = leaveRequests.filter((request: any) => request.status === "REJECTED").length;
  const filters: Array<{ label: string; value: LeaveFilter }> = [
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Leave requests" 
        description={isAdmin ? "Review employee leave requests and track approval history." : "Submit leave requests and track their review status."} 
        icon={CalendarClock} 
      />



      {!isAdmin ? (
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{selectedMonth} Approved Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{monthlyApprovedLeaves ?? 0} days</div>
          </CardContent>
        </Card>
      ) : null}

      {!isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Submit leave request</CardTitle>
            <CardDescription>Request leave with date, overlap, and reason validation.</CardDescription>
          </CardHeader>
          <CardContent>
            <LeaveRequestForm
              employees={employees.map((employee) => ({
                id: employee.id,
                name: `${employee.firstName} ${employee.lastName}`
              }))}
              canChooseEmployee={false}
            />
          </CardContent>
        </Card>
      ) : null}

      {isAdmin ? (
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{approvedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{rejectedCount}</div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <CardTitle>Requests</CardTitle>
              <CardDescription>
                {isAdmin ? `${visibleLeaveRequests.length} leave requests in this view.` : `${visibleLeaveRequests.length} leave requests for your employee record.`}
              </CardDescription>
            </div>
            {isAdmin ? (
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <Button key={filter.value} asChild size="sm" variant={selectedStatus === filter.value ? "default" : "outline"}>
                    <Link href={`/leave-requests?status=${filter.value}`}>{filter.label}</Link>
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[920px]">
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                {isAdmin ? <TableHead className="min-w-80">Admin action</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleLeaveRequests.length ? (
                visibleLeaveRequests.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-semibold text-sm">
                        {request.employee.firstName} {request.employee.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{request.employee.department.name}</div>
                      {isAdmin && request.status === "PENDING" ? (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30">
                          Approved Leaves This Year: {request.employee.approvedLeavesThisYear ?? 0} days
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>{titleCase(request.type)}</TableCell>
                    <TableCell>
                      {request.startDate.toLocaleDateString("en-IN", { dateStyle: "medium" })} -{" "}
                      {request.endDate.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={leaveBadgeVariant(request.status)}>{titleCase(request.status)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{request.reason}</p>
                      {request.reviewNote ? <p className="mt-1 text-xs text-muted-foreground">Note: {request.reviewNote}</p> : null}
                      {request.reviewer ? <p className="mt-1 text-xs text-muted-foreground">Reviewed by {request.reviewer.name ?? request.reviewer.email}</p> : null}
                    </TableCell>
                    {isAdmin ? (
                      <TableCell>
                        <LeaveReviewActions id={request.id} disabled={request.status !== "PENDING"} />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="py-8">
                    <EmptyState
                      icon={Send}
                      title="No leave requests yet"
                      description="Submitted leave requests will appear here with review status, notes, and admin actions."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Yearly Leaves Approved ({selectedMonth.slice(0, 4)})</CardTitle>
            <CardDescription>Approved leave days for every month in this year.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {yearlyApprovedLeaves.map((monthData: { month: string; days: number }) => {
                const monthDate = new Date(`${monthData.month}-02`);
                const monthName = monthDate.toLocaleString("default", { month: "short" });
                const isSelected = monthData.month === selectedMonth;
                return (
                  <Link href={`?month=${monthData.month}`} key={monthData.month}>
                    <Card className={`cursor-pointer transition-colors hover:border-primary ${isSelected ? "border-primary bg-primary/5" : ""}`}>
                      <CardContent className="flex flex-col items-center justify-center p-4">
                        <span className="text-sm font-medium text-muted-foreground">{monthName}</span>
                        <span className="mt-2 text-2xl font-bold text-foreground">{monthData.days}</span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
