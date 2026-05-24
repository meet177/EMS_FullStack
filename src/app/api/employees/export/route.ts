import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";



export async function GET() {
  try {
    // 1. Authorize the user (admin only)
    await requireAdmin();

    // 2. Fetch all employees from the database
    const employees = await prisma.employee.findMany({
      include: { department: true },
      orderBy: { joinedAt: "desc" }
    });

    // 3. Define CSV headers
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Job Title",
      "Department Name",
      "Department Code",
      "Status",
      "Salary",
      "Joined At"
    ];

    // Helper to escape CSV values
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // 4. Generate CSV lines
    const csvLines = [
      headers.join(","),
      ...employees.map((emp) =>
        [
          emp.id,
          emp.firstName,
          emp.lastName,
          emp.email,
          emp.phone || "",
          emp.jobTitle,
          emp.department.name,
          emp.department.code,
          emp.status,
          emp.salary || "",
          emp.joinedAt.toISOString().slice(0, 10)
        ]
          .map(escapeCSV)
          .join(",")
      )
    ];

    const csvContent = csvLines.join("\n");

    // 5. Return CSV response
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=employees_export.csv",
        "Cache-Control": "no-cache"
      }
    });
  } catch (error: any) {
    // If it's a Next.js redirect thrown by requireAdmin(), let Next.js handle it
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Export error:", error);
    return new Response("Unauthorized or failed to export employees", { status: 401 });
  }
}
