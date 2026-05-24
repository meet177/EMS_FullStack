import { NextResponse } from "next/server";
import { syncEmployeeStatuses } from "@/lib/db/employees";



export async function GET() {
  try {
    await syncEmployeeStatuses();
    return NextResponse.json({ ok: true, message: "Employee statuses synchronized successfully." });
  } catch (error: any) {
    console.error("Error in sync-employee-statuses cron:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to synchronize employee statuses." },
      { status: 500 }
    );
  }
}
