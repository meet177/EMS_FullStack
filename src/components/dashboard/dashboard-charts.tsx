"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { titleCase } from "@/lib/utils";

type DepartmentChartDatum = {
  name: string;
  employees: number;
};

type StatusChartDatum = {
  name: string;
  value: number;
};

const statusColors: Record<string, string> = {
  ACTIVE: "#10b981",
  ON_LEAVE: "#f59e0b"
};

export function DashboardCharts({
  departmentData,
  statusData
}: {
  departmentData: DepartmentChartDatum[];
  statusData: StatusChartDatum[];
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Employees by department</CardTitle>
          <CardDescription>Headcount distribution across teams.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ left: -20, right: 12 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--card-foreground))"
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="employees" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee status</CardTitle>
          <CardDescription>Active and leave ratio.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={104} paddingAngle={3}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={statusColors[entry.name] ?? "hsl(var(--primary))"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, titleCase(String(name))]}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--card-foreground))"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid gap-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[item.name] }} />
                  {titleCase(item.name)}
                </span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
