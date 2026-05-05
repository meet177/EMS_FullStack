import { BarChart3, BriefcaseBusiness, CalendarCheck2, Search, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const features = [
  { title: "Lightning Search", description: "Find anyone instantly with prefix-prioritized matching across names, roles, and departments.", icon: Search },
  { title: "Daily & Monthly Tracking", description: "Monitor exact daily statuses (Present, WFH, Late) and track accurate monthly attendance percentages.", icon: BarChart3 },
  {
    title: "Yearly Leave Intelligence",
    description: "Show approved leave days by month for employees and yearly approved totals for admins reviewing pending requests.",
    icon: CalendarCheck2
  }
];

const footerFeatures = [
  "Prefix-Prioritized Search",
  "Daily Attendance Summaries",
  "Monthly Tracking Analytics",
  "Yearly Approved Leave Counters"
];

export default async function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-3 transition-transform duration-300 hover:-translate-y-0.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            <Users className="h-5 w-5" />
          </div>
          <span className="font-semibold">ManageWise</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">Login/Sign Up</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link href="/admin/sign-in">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Admin login
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/employee/sign-in">
                  <BriefcaseBusiness className="mr-2 h-4 w-4" />
                  Employee login
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(70vh-4rem)] w-full max-w-7xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">Employee Management System</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            A smart employee management system for attendance, employee records, and leave decisions. Employees can track monthly and yearly leave approvals, while admins review pending requests with the right yearly context in front of them.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg">Login/Sign Up</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/admin/sign-in">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/employee/sign-in">
                    <BriefcaseBusiness className="mr-2 h-4 w-4" />
                    Employee login
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-6 pb-12 lg:grid-cols-2">
        <div className="group relative cursor-pointer rounded-lg border bg-card p-3 shadow-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:border-primary/40 hover:shadow-xl">
          <div className="rounded-md border bg-background">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <p className="text-sm font-semibold">Employee Dashboard</p>
                <p className="text-xs text-muted-foreground">Personal workspace</p>
              </div>
              <Badge variant="success">Today</Badge>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-3">
              {[
                ["Monthly attendance", "96%", "text-primary"],
                ["Monthly approved", "3 days", "text-emerald-600 dark:text-emerald-300"],
                ["Pending leave", "1", "text-amber-600 dark:text-amber-300"]
              ].map(([label, value, tone]) => (
                <div key={label} className="cursor-pointer rounded-lg border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`mt-2 text-xl font-semibold ${tone}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 border-t p-4 md:grid-cols-[0.85fr_1.15fr]">
              <div className="cursor-pointer rounded-md border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <p className="text-sm font-medium">Today attendance</p>
                <div className="mt-4 space-y-3">
                  {[
                    ["Check in", "09:32 AM"],
                    ["Check out", "06:10 PM"],
                    ["Status", "Work From Home"]
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  ["Ask for sick leave", "Pending", "warning"],
                  ["Approved this month", "3 days", "success"],
                  ["Approved this year", "14 days", "success"]
                ].map(([title, status, variant]) => (
                  <div key={title} className="flex cursor-pointer items-center justify-between rounded-md border bg-card p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground">Employee leave</p>
                    </div>
                    <Badge variant={variant as "success" | "warning"}>{status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="group relative cursor-pointer rounded-lg border bg-card p-3 shadow-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:border-primary/40 hover:shadow-xl">
            <div className="rounded-md border bg-background">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <p className="text-sm font-semibold">Admin Dashboard</p>
                  <p className="text-xs text-muted-foreground">Workforce overview</p>
                </div>
                <Badge variant="success">Live</Badge>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {[
                  ["Present", "110", "text-emerald-600 dark:text-emerald-300"],
                  ["WFH", "12", "text-sky-600 dark:text-sky-300"],
                  ["Late", "2", "text-amber-600 dark:text-amber-300"],
                  ["Absent", "4", "text-rose-600 dark:text-rose-300"]
                ].map(([label, value, tone]) => (
                  <div key={label} className="cursor-pointer rounded-lg border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 border-t p-4 md:grid-cols-[1fr_0.75fr]">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Pending leave requests</p>
                  {[
                    { name: "Isha Rao", dept: "Design", leave: "Casual leave", badge: "8 approved this year", variant: "warning" },
                    { name: "Aarav Mehta", dept: "Engineering", leave: "Sick leave", badge: "3 approved this year", variant: "success" },
                    { name: "Naina Kapoor", dept: "People", leave: "Paid leave", badge: "18 approved this year", variant: "destructive" },
                  ].map((emp) => (
                    <div key={emp.name} className="flex cursor-pointer items-center justify-between rounded-md border bg-card p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                      <div>
                        <p className="text-sm font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.dept} · {emp.leave}</p>
                      </div>
                      <Badge variant={emp.variant as any}>{emp.badge}</Badge>
                    </div>
                  ))}
                </div>
                <div className="cursor-pointer rounded-md border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                  <p className="text-sm font-medium">Monthly Attendance</p>
                  <div className="mt-4 space-y-3">
                    {["Isha Rao", "Meet Kiyada", "Kabir Sinha"].map((emp, index) => (
                      <div key={emp}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span>{emp}</span>
                          <span className="text-muted-foreground">{[100, 96, 85][index]}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className={`h-2 rounded-full ${index === 2 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${[100, 96, 85][index]}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-6 pb-12 md:grid-cols-3">
        {features.map(({ title, description, icon: Icon }) => (
          <div key={title} className="group cursor-pointer rounded-lg border bg-card p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:border-primary/40 hover:shadow-xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>

      <footer className="border-t bg-card/50">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div>
            <Link href="/" className="group inline-flex items-center gap-3 transition-transform duration-300 hover:-translate-y-0.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                <Users className="h-5 w-5" />
              </div>
              <span className="font-semibold">ManageWise</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              A powerful platform featuring lightning-fast prefix search, real-time attendance tracking, and yearly leave approval visibility.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Features</h2>
            <div className="mt-4 grid gap-3">
              {footerFeatures.map((feature) => (
                <span key={feature} className="cursor-pointer rounded-md px-2 py-1 text-sm text-muted-foreground transition-all duration-300 hover:translate-x-1 hover:bg-primary/10 hover:text-foreground">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Access</h2>
            <div className="mt-4 flex flex-col gap-2">
              <Button type="button" variant="outline" className="justify-start transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <ShieldCheck className="h-4 w-4" />
                Admin login
              </Button>
              <Button type="button" variant="outline" className="justify-start transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <BriefcaseBusiness className="h-4 w-4" />
                Employee login
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 ManageWise. All rights reserved.</p>
            <p>Built for modern workforce operations.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
