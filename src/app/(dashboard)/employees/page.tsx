import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, UserPlus, UsersRound, X } from "lucide-react";
import Link from "next/link";
import { EmployeeSearchInput } from "@/components/employees/employee-search-input";

import { EmployeeActionsDropdown } from "@/components/employees/employee-actions-dropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/authz";
import { getEmployeesPage } from "@/lib/db/employees";
import { departments } from "@/lib/constants";
import { formatCurrency, titleCase } from "@/lib/utils";


type EmployeesPageProps = {
  searchParams?: Promise<{
    q?: string;
    department?: string;
    page?: string;
    sort?: string;
    direction?: string;
  }>;
};

type EmployeeSearchParams = {
  q?: string;
  department?: string;
  page?: string;
  sort?: string;
  direction?: string;
};

async function getEmployeesPageData(query: EmployeeSearchParams) {
  return await getEmployeesPage({
    search: query.q,
    departmentCode: query.department,
    page: Number(query.page) || 1,
    sort: query.sort || "joinedAt",
    direction: query.direction === "asc" ? "asc" : "desc"
  });
}

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  await requireAdmin();

  const params = (await searchParams) ?? {};
  const { employees, total, page, totalPages } = await getEmployeesPageData(params);
  const sort = params.sort ?? "joinedAt";
  const direction = params.direction === "asc" ? "asc" : "desc";
  const nextDirection = direction === "asc" ? "desc" : "asc";
  const makeHref = (overrides: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams();
    if (params.q) next.set("q", params.q);
    if (params.department) next.set("department", params.department);
    if (sort) next.set("sort", sort);
    next.set("direction", direction);
    next.set("page", String(page));

    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined || value === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    }

    return `/employees?${next.toString()}`;
  };
  const sortHref = (column: string) =>
    makeHref({
      sort: column,
      direction: sort === column ? nextDirection : "asc",
      page: 1
    });
  const SortIcon = ({ column }: { column: string }) =>
    sort === column ? direction === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" /> : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Review and manage employee records created through the employee portal." />



      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
            <CardTitle>Directory</CardTitle>
            <CardDescription>
              {total} total employees
            </CardDescription>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <UsersRound className="h-5 w-5" />
            </div>
          </div>
          <form className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <EmployeeSearchInput />
            <Select name="department" defaultValue={params.department ?? ""}>
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.code} value={department.code}>
                  {department.name}
                </option>
              ))}
            </Select>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 md:flex-none">
                Filter
              </Button>
              <Button asChild type="button" variant="outline" size="icon" aria-label="Clear filters">
                <Link href="/employees">
                  <X className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </form>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[880px]">
            <TableHeader>
              <TableRow>
                {[
                  ["name", "Name"],
                  ["department", "Department"],
                  ["role", "Role"],
                  ["status", "Status"],
                  ["salary", "Salary"],
                  ["joinedAt", "Joined"]
                ].map(([column, label]) => (
                  <TableHead key={column}>
                    <Button asChild variant="ghost" className="-ml-3 h-8 gap-1 px-2">
                      <Link href={sortHref(column)}>
                        {label}
                        <SortIcon column={column} />
                      </Link>
                    </Button>
                  </TableHead>
                ))}
                <TableHead className="w-36 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length ? (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">{employee.email}</div>
                    </TableCell>
                    <TableCell>{employee.department.name}</TableCell>
                    <TableCell>{employee.jobTitle}</TableCell>
                    <TableCell>
                      <Badge variant={employee.status === "ACTIVE" ? "success" : employee.status === "ON_LEAVE" ? "warning" : "muted"}>
                        {titleCase(employee.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(employee.salary)}</TableCell>
                    <TableCell>{employee.joinedAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <EmployeeActionsDropdown id={employee.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8">
                    <EmptyState
                      icon={UserPlus}
                      title={params.q || params.department ? "No matching employees" : "No employees yet"}
                      description={
                        params.q || params.department
                          ? "Try adjusting the search or department filter to find the right record."
                          : "Add the first employee above and the directory will appear here."
                      }
                      action={
                        params.q || params.department ? (
                          <Button asChild variant="outline" size="sm">
                            <Link href="/employees">
                              <X className="h-4 w-4" />
                              Clear filters
                            </Link>
                          </Button>
                        ) : null
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" aria-disabled={page <= 1}>
                <Link href={makeHref({ page: Math.max(page - 1, 1) })} className={page <= 1 ? "pointer-events-none opacity-50" : ""}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" aria-disabled={page >= totalPages}>
                <Link
                  href={makeHref({ page: Math.min(page + 1, totalPages) })}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
