import { ArrowUpRight, BriefcaseBusiness, Building2, CalendarClock, Users } from "lucide-react";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdmin } from "@/lib/authz";
import { getDashboardMetrics } from "@/lib/db/employees";
import { formatCurrency, titleCase } from "@/lib/utils";


async function getDashboardData() {
  return await getDashboardMetrics();
}

export default async function DashboardPage() {
  await requireAdmin();

  const {
    totalEmployees,
    activeEmployees,
    departmentCount,
    pendingLeaveRequests,
    recentEmployees,
    departments,
    departmentChartData,
    statusChartData
  } = await getDashboardData();

  const stats = [
    { label: "Total employees", value: totalEmployees, hint: "All recorded staff", icon: Users, tone: "text-primary", ring: "bg-primary/10" },
    {
      label: "Active",
      value: activeEmployees,
      hint: "Currently available",
      icon: BriefcaseBusiness,
      tone: "text-emerald-600 dark:text-emerald-300",
      ring: "bg-emerald-500/10"
    },
    {
      label: "Departments",
      value: departmentCount,
      hint: "Teams configured",
      icon: Building2,
      tone: "text-sky-600 dark:text-sky-300",
      ring: "bg-sky-500/10"
    },
    {
      label: "Pending leaves",
      value: pendingLeaveRequests,
      hint: "Awaiting review",
      icon: CalendarClock,
      tone: "text-amber-600 dark:text-amber-300",
      ring: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="A concise command center for headcount, staffing status, recent hires, and department distribution."
        badge="Workforce overview"
      />



      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <CardDescription>{stat.hint}</CardDescription>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-md ${stat.ring}`}>
                <stat.icon className={`h-5 w-5 ${stat.tone}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-normal">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <DashboardCharts departmentData={departmentChartData} statusData={statusChartData} />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent hires</CardTitle>
            <CardDescription>Newest employee records in the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEmployees.length ? (
              recentEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{employee.jobTitle}</p>
                  </div>
                  <Badge variant={employee.status === "ACTIVE" ? "success" : employee.status === "ON_LEAVE" ? "warning" : "muted"}>
                    {titleCase(employee.status)}
                  </Badge>
                </div>
              ))
            ) : (
              <EmptyState icon={Users} title="No recent hires" description="New employee records will appear here after they are added." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Departments</CardTitle>
                <CardDescription className="mt-1">Headcount by department.</CardDescription>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {departments.length ? (
              departments.map((item) => {
                const percent = totalEmployees ? Math.round((item._count.employees / totalEmployees) * 100) : 0;
                return (
                  <div key={item.department.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.department.name}</span>
                      <span className="text-muted-foreground">{item._count.employees}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState icon={Building2} title="No department data" description="Department distribution appears after employees are added." />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
