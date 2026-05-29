import { CalendarDays, Clock, Percent, UserCheck, Users, Search, Filter, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AttendanceForm } from "@/components/attendance/attendance-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendanceStatus, UserRole } from "@/generated/prisma/client";
import { attendanceStatuses, departments } from "@/lib/constants";
import { 
  getAttendanceSummary, 
  getDailyAttendanceReport, 
  getMonthlyAttendancePercentageReport,
  getYearlyAttendancePercentage
} from "@/lib/db/attendance";
import { getAccessContext } from "@/lib/authz";
import { isClerkConfigured } from "@/lib/env";
import { getPageLoadErrorMessage } from "@/lib/errors";
import { titleCase } from "@/lib/utils";


type AttendancePageProps = {
  searchParams?: Promise<{
    date?: string;
    month?: string;
    department?: string;
    monthlyDept?: string;
    status?: string;
  }>;
};

function statusBadgeVariant(status: AttendanceStatus) {
  if (status === AttendanceStatus.PRESENT || status === AttendanceStatus.WORK_FROM_HOME) return "success";
  if (status === AttendanceStatus.LATE || status === AttendanceStatus.HALF_DAY) return "warning";
  if (status === AttendanceStatus.ABSENT) return "destructive";
  return "muted";
}

function formatTime(value?: Date | null) {
  if (!value) return "Not marked";

  return value.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const { user, isAdmin } = await getAccessContext();
  if (!user) redirect("/sign-in");

  const clerkEnabled = isClerkConfigured();
  if (clerkEnabled && !isAdmin && !user?.employee?.id) redirect("/employee/onboarding");

  const params = (await searchParams) ?? {};

  // Resolve daily variables
  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedDateStr = params.date && params.date <= todayStr ? params.date : todayStr;
  const selectedDate = new Date(selectedDateStr);
  const selectedDept = params.department || "";

  // Resolve monthly variables
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const selectedMonth = params.month ?? currentMonthStr;
  const selectedMonthlyDept = params.monthlyDept || "";

  let dailyReport = null;
  let monthlyReport = null;
  let employeeSummary = null;
  let employeeRecords: any[] = [];
  let yearlyReport: { month: string; percentage: number }[] = [];
  if (isAdmin) {
    // Admin dashboard data
    dailyReport = await getDailyAttendanceReport(selectedDate, selectedDept);
    monthlyReport = await getMonthlyAttendancePercentageReport(selectedMonth, selectedMonthlyDept);
  } else {
    // Employee portal data
    const employee = user?.employee;
    const summary = employee?.id 
      ? await getAttendanceSummary({ employeeId: employee.id, month: selectedMonth }) 
      : await getAttendanceSummary({ employeeId: "missing", month: selectedMonth });
    employeeSummary = summary;
    employeeRecords = summary.records;
    yearlyReport = employee?.id 
      ? await getYearlyAttendancePercentage(employee.id, parseInt(selectedMonth.slice(0, 4)))
      : [];
  }

  // --- RENDER EMPLOYEE VIEW ---
  if (!isAdmin) {
    const stats = [
      { label: "Marked records", value: employeeSummary?.totalRecords ?? 0, hint: `${employeeSummary?.markedDays ?? 0} marked days`, icon: CalendarDays },
      { label: "Attendance rate", value: `${employeeSummary?.attendanceRate ?? 0}%`, hint: "Present, late, half day, or WFH", icon: Percent },
      { label: "Late marks", value: employeeSummary?.late ?? 0, hint: "Requires attention", icon: Clock },
      { label: "Completion", value: `${employeeSummary?.completionRate ?? 0}%`, hint: "Marked records vs expected marks", icon: UserCheck }
    ];

    return (
      <div className="space-y-6">
        <PageHeader title="Attendance" description="Mark your attendance and review your monthly history." icon={Users} />



        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{employeeSummary?.month} Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{employeeSummary?.attendanceRate ?? 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mark attendance</CardTitle>
            <CardDescription>One attendance record is stored per day. Updating the same day replaces the existing mark.</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceForm
              employees={user?.employee ? [{ id: user.employee.id, name: `${user.employee.firstName} ${user.employee.lastName}` }] : []}
              canChooseEmployee={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance history</CardTitle>
            <CardDescription>All marked records for your employee record in this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check in</TableHead>
                  <TableHead>Check out</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeRecords.length ? (
                  employeeRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date.toLocaleDateString("en-IN", { dateStyle: "medium" })}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(record.status)}>{titleCase(record.status)}</Badge>
                      </TableCell>
                      <TableCell>{formatTime(record.checkIn)}</TableCell>
                      <TableCell>{formatTime(record.checkOut)}</TableCell>
                      <TableCell>{record.notes ?? "No notes"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      <EmptyState icon={CalendarDays} title="No records found" description="You have not submitted attendance for this month yet." />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yearly Overview ({selectedMonth.slice(0, 4)})</CardTitle>
            <CardDescription>Click on a month to view its detailed attendance history.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {yearlyReport.map((monthData) => {
                const monthDate = new Date(`${monthData.month}-02`);
                const monthName = monthDate.toLocaleString('default', { month: 'short' });
                const isSelected = monthData.month === selectedMonth;
                return (
                  <Link href={`?month=${monthData.month}`} key={monthData.month}>
                    <Card className={`cursor-pointer transition-colors hover:border-primary ${isSelected ? 'border-primary bg-primary/5' : ''}`}>
                      <CardContent className="flex flex-col items-center justify-center p-4">
                        <span className="text-sm font-medium text-muted-foreground">{monthName}</span>
                        <span className="mt-2 text-2xl font-bold text-foreground">{monthData.percentage}%</span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- RENDER ADMIN DASHBOARD ---
  const dailyStats = dailyReport ? [
    { label: "Present", value: dailyReport.statusCounts.PRESENT, color: "text-emerald-600 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20" },
    { label: "Absent", value: dailyReport.statusCounts.ABSENT, color: "text-destructive border-red-200 bg-red-50/50 dark:bg-red-950/20" },
    { label: "Work From Home", value: dailyReport.statusCounts.WORK_FROM_HOME, color: "text-blue-600 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20" },
    { label: "Late Marks", value: dailyReport.statusCounts.LATE, color: "text-amber-600 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20" },
    { label: "Half Days", value: dailyReport.statusCounts.HALF_DAY, color: "text-purple-600 border-purple-200 bg-purple-50/50 dark:bg-purple-950/20" }
  ] : [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader title="Attendance Dashboard" description="Monitor daily reports, filter department metrics, and track monthly employee performance." icon={CalendarDays} />



      {/* SECTION 1: Daily Attendance Report (Top) */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="border-b bg-muted/40 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Daily Attendance Report
              </CardTitle>
              <CardDescription>View and manage specific day attendance counts and employee details.</CardDescription>
            </div>
            <form className="flex flex-wrap items-end gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="date" className="text-xs">Select Date</Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  max={todayStr} 
                  defaultValue={selectedDateStr} 
                  className="h-9 w-40"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="department" className="text-xs">Department</Label>
                <Select id="department" name="department" defaultValue={selectedDept} className="h-9 w-48">
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.code} value={dept.code}>{dept.name}</option>
                  ))}
                </Select>
              </div>
              <Button type="submit" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Status Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            {dailyStats.map((stat) => (
              <div key={stat.label} className={`rounded-xl border p-4 shadow-xs transition-all ${stat.color}`}>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-85">{stat.label}</div>
                <div className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Daily Attendance List */}
          <div className="rounded-lg border">
            <div className="bg-muted/30 px-4 py-3 border-b flex justify-between items-center">
              <span className="font-medium text-sm">Attendance List for {selectedDateStr}</span>
              <Badge variant="outline" className="text-xs">
                {dailyReport?.report.length ?? 0} Employees
              </Badge>
            </div>
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-muted/10">
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check in</TableHead>
                  <TableHead>Check out</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyReport && dailyReport.report.length ? (
                  dailyReport.report.map((record) => (
                    <TableRow key={record.employeeId} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{record.name}</TableCell>
                      <TableCell>{record.departmentName}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(record.status)}>{titleCase(record.status)}</Badge>
                      </TableCell>
                      <TableCell>{formatTime(record.checkIn)}</TableCell>
                      <TableCell>{formatTime(record.checkOut)}</TableCell>
                      <TableCell className="max-w-xs text-muted-foreground truncate">
                        {record.notes ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No employees found matching the filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Monthly Attendance Tracking System (Bottom) */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="border-b bg-muted/40 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" /> Monthly Attendance Tracking
              </CardTitle>
              <CardDescription>Track percentage attendance sheets for employees to analyze performance.</CardDescription>
            </div>
            <form className="flex flex-wrap items-end gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="month" className="text-xs">Select Month</Label>
                <Input 
                  id="month" 
                  name="month" 
                  type="month" 
                  defaultValue={selectedMonth} 
                  className="h-9 w-40"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="monthlyDept" className="text-xs">Department</Label>
                <Select id="monthlyDept" name="monthlyDept" defaultValue={selectedMonthlyDept} className="h-9 w-48">
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.code} value={dept.code}>{dept.name}</option>
                  ))}
                </Select>
              </div>
              <Button type="submit" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border">
            <div className="bg-muted/30 px-4 py-3 border-b flex justify-between items-center">
              <span className="font-medium text-sm">Monthly Attendance Percentages ({selectedMonth})</span>
              <Badge variant="secondary" className="text-xs font-semibold">
                {monthlyReport?.markedDaysCount ?? 0} Marked Working Days
              </Badge>
            </div>
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-muted/10">
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead className="text-center">Present / WFH / Late</TableHead>
                  <TableHead className="text-center">Half Days</TableHead>
                  <TableHead className="text-center">Absent Days</TableHead>
                  <TableHead className="text-right pr-6">Monthly Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyReport && monthlyReport.report.length ? (
                  monthlyReport.report.map((record) => {
                    const pct = record.percentage;
                    let pctColor = "bg-red-500";
                    let pctTxt = "text-red-600 dark:text-red-400";
                    if (pct >= 85) {
                      pctColor = "bg-emerald-500";
                      pctTxt = "text-emerald-600 dark:text-emerald-400";
                    } else if (pct >= 60) {
                      pctColor = "bg-amber-500";
                      pctTxt = "text-amber-600 dark:text-amber-400";
                    }

                    return (
                      <TableRow key={record.employeeId} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="font-semibold text-sm">{record.name}</div>
                          <div className="text-xs text-muted-foreground">{record.email}</div>
                        </TableCell>
                        <TableCell>{record.departmentName}</TableCell>
                        <TableCell>{record.jobTitle}</TableCell>
                        <TableCell className="text-center font-medium">{record.presentCount} days</TableCell>
                        <TableCell className="text-center font-medium">{record.halfDayCount} days</TableCell>
                        <TableCell className="text-center font-medium">{record.absentCount} days</TableCell>
                        <TableCell className="text-right pr-6 font-bold">
                          <div className="flex items-center justify-end gap-3">
                            <span className={pctTxt}>{pct}%</span>
                            <div className="w-16 bg-muted rounded-full h-1.5 hidden md:block">
                              <div className={`h-1.5 rounded-full ${pctColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No monthly records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
