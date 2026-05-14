export const departments = [
  { name: "Engineering", code: "ENGINEERING" },
  { name: "Product", code: "PRODUCT" },
  { name: "Design", code: "DESIGN" },
  { name: "Sales", code: "SALES" },
  { name: "Marketing", code: "MARKETING" },
  { name: "Finance", code: "FINANCE" },
  { name: "People", code: "PEOPLE" },
  { name: "Operations", code: "OPERATIONS" }
] as const;

export const departmentCodes = departments.map((department) => department.code) as [
  "ENGINEERING",
  "PRODUCT",
  "DESIGN",
  "SALES",
  "MARKETING",
  "FINANCE",
  "PEOPLE",
  "OPERATIONS"
];

export const employeeStatuses = ["ACTIVE", "ON_LEAVE", "OFFBOARDED"] as const;

export const leaveTypes = ["CASUAL", "SICK", "PAID", "UNPAID", "MATERNITY", "PATERNITY", "BEREAVEMENT"] as const;

export const attendanceStatuses = ["PRESENT", "ABSENT", "LATE", "HALF_DAY", "WORK_FROM_HOME"] as const;
