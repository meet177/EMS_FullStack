import "dotenv/config";

import {
  AttendanceStatus,
  EmployeeStatus,
  LeaveStatus,
  LeaveType,
  PrismaClient,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

const departments = [
  { code: "ENGINEERING", name: "Engineering", description: "Builds and maintains the product platform." },
  { code: "PRODUCT", name: "Product", description: "Owns roadmap, research, and product delivery." },
  { code: "DESIGN", name: "Design", description: "Creates product experiences and design systems." },
  { code: "SALES", name: "Sales", description: "Handles revenue, leads, and customer acquisition." },
  { code: "MARKETING", name: "Marketing", description: "Runs brand, campaigns, and demand generation." },
  { code: "FINANCE", name: "Finance", description: "Manages payroll, budgets, and compliance." },
  { code: "PEOPLE_OPS", name: "People Operations", description: "Supports hiring, onboarding, and employee relations." },
  { code: "BUSINESS_OPS", name: "Business Operations", description: "Improves internal process and company operations." },
  { code: "CUSTOMER_SUCCESS", name: "Customer Success", description: "Owns customer onboarding, support, and retention." },
  { code: "DATA_ANALYTICS", name: "Data & Analytics", description: "Creates reporting, dashboards, and business insights." }
];

const employeeRows = [
  ["Aarav", "Mehta", "Engineering Manager", "ENGINEERING", 3400000, "2021-04-12"],
  ["Dev", "Bansal", "Senior Frontend Engineer", "ENGINEERING", 2500000, "2022-06-05"],
  ["Riya", "Shah", "Backend Engineer", "ENGINEERING", 2300000, "2023-02-14"],
  ["Kabir", "Sinha", "Platform Engineer", "ENGINEERING", 2600000, "2021-09-03"],
  ["Ananya", "Kulkarni", "QA Automation Engineer", "ENGINEERING", 1800000, "2024-01-08"],

  ["Meera", "Nair", "Product Lead", "PRODUCT", 3000000, "2020-08-29"],
  ["Vihaan", "Desai", "Product Manager", "PRODUCT", 2400000, "2022-11-16"],
  ["Sana", "Qureshi", "Associate Product Manager", "PRODUCT", 1500000, "2024-07-22"],
  ["Isha", "Rao", "Design Manager", "DESIGN", 2600000, "2021-01-17"],
  ["Nikhil", "Verma", "Product Designer", "DESIGN", 1900000, "2023-03-27"],

  ["Rohan", "Malik", "Sales Director", "SALES", 3200000, "2019-11-08"],
  ["Priya", "Menon", "Enterprise Account Executive", "SALES", 2200000, "2022-05-19"],
  ["Tara", "Gill", "Marketing Manager", "MARKETING", 2100000, "2021-09-16"],
  ["Yash", "Arora", "Content Strategist", "MARKETING", 1450000, "2023-08-01"],
  ["Vikram", "Reddy", "Finance Controller", "FINANCE", 2800000, "2020-03-23"],

  ["Aditi", "Chopra", "Payroll Specialist", "FINANCE", 1500000, "2022-12-12"],
  ["Naina", "Kapoor", "People Ops Partner", "PEOPLE_OPS", 2000000, "2021-02-21"],
  ["Leena", "Thomas", "Talent Acquisition Lead", "PEOPLE_OPS", 1850000, "2022-07-11"],
  ["Arjun", "Menon", "Operations Manager", "BUSINESS_OPS", 2250000, "2020-10-15"],
  ["Kavya", "Pillai", "Office Administrator", "BUSINESS_OPS", 1150000, "2023-05-25"],

  ["Neha", "Kapadia", "Customer Success Manager", "CUSTOMER_SUCCESS", 1850000, "2023-10-02"],
  ["Om", "Prakash", "Support Specialist", "CUSTOMER_SUCCESS", 1450000, "2024-09-09"],
  ["Maya", "Sen", "Data Analyst", "DATA_ANALYTICS", 1750000, "2022-01-31"],
  ["Sameer", "Khan", "BI Engineer", "DATA_ANALYTICS", 1900000, "2024-06-03"],
  ["Tanya", "Roy", "Research Analyst", "DATA_ANALYTICS", 1700000, "2024-04-10"]
] as const;

const todayStatusByGroup = [
  AttendanceStatus.PRESENT,
  AttendanceStatus.ABSENT,
  AttendanceStatus.WORK_FROM_HOME,
  AttendanceStatus.HALF_DAY,
  AttendanceStatus.LATE
];

const presentLikeDaysByGroup = [3, 7, 11, 15, 19];

const employees = employeeRows.map(([firstName, lastName, jobTitle, departmentCode, salary, joinedAt], index) => {
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@managewise.example`;
  const group = Math.floor(index / 5);

  return {
    firstName,
    lastName,
    email,
    phone: `+91 98765 ${String(43010 + index)}`,
    jobTitle,
    departmentCode,
    status: todayStatusByGroup[group] === AttendanceStatus.ABSENT ? EmployeeStatus.ON_LEAVE : EmployeeStatus.ACTIVE,
    salary,
    joinedAt: new Date(joinedAt),
    todayStatus: todayStatusByGroup[group],
    presentLikeTarget: presentLikeDaysByGroup[group],
    user: {
      clerkId: `seed_employee_${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
      email,
      name: `${firstName} ${lastName}`
    }
  };
});

const departmentManagers: Record<string, string> = {
  ENGINEERING: "aarav.mehta@managewise.example",
  PRODUCT: "meera.nair@managewise.example",
  DESIGN: "isha.rao@managewise.example",
  SALES: "rohan.malik@managewise.example",
  MARKETING: "tara.gill@managewise.example",
  FINANCE: "vikram.reddy@managewise.example",
  PEOPLE_OPS: "naina.kapoor@managewise.example",
  BUSINESS_OPS: "arjun.menon@managewise.example",
  CUSTOMER_SUCCESS: "neha.kapadia@managewise.example",
  DATA_ANALYTICS: "maya.sen@managewise.example"
};

const leaveRequests = [
  ["seed_leave_001", "aarav.mehta@managewise.example", LeaveType.CASUAL, LeaveStatus.PENDING, 24, 25, "Family function out of station.", null],
  ["seed_leave_002", "meera.nair@managewise.example", LeaveType.PAID, LeaveStatus.PENDING, 26, 28, "Planned vacation after product release.", null],
  ["seed_leave_003", "isha.rao@managewise.example", LeaveType.SICK, LeaveStatus.PENDING, 23, 23, "Doctor appointment and rest.", null],
  ["seed_leave_004", "priya.menon@managewise.example", LeaveType.CASUAL, LeaveStatus.PENDING, 27, 27, "Personal work requiring one day away.", null],
  ["seed_leave_005", "leena.thomas@managewise.example", LeaveType.PAID, LeaveStatus.PENDING, 29, 30, "Long weekend leave request.", null],
  ["seed_leave_006", "meera.nair@managewise.example", LeaveType.PAID, LeaveStatus.APPROVED, 6, 6, "Planned leave for personal work.", "Approved with product ownership covered by Vihaan."],
  ["seed_leave_007", "vihaan.desai@managewise.example", LeaveType.SICK, LeaveStatus.APPROVED, 10, 12, "Medical rest advised by doctor.", "Approved. Product ceremonies were reassigned for the week."],
  ["seed_leave_008", "isha.rao@managewise.example", LeaveType.CASUAL, LeaveStatus.APPROVED, 15, 19, "Personal time off after design review.", "Approved after design handoff was completed."],
  ["seed_leave_009", "sana.qureshi@managewise.example", LeaveType.UNPAID, LeaveStatus.REJECTED, 11, 13, "Extended personal travel.", "Rejected because customer interviews are scheduled that week."],
  ["seed_leave_010", "sameer.khan@managewise.example", LeaveType.CASUAL, LeaveStatus.REJECTED, 18, 18, "Personal errand during reporting close.", "Rejected because monthly analytics close requires coverage."]
] as const;

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function currentMonthDay(day: number) {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), Math.min(day, lastDay)));
}

function attendanceDays() {
  const today = todayUtc();
  const days: Date[] = [today];

  for (let day = 1; days.length < 20; day += 1) {
    const next = currentMonthDay(day);
    if (next.getTime() !== today.getTime() && !days.some((item) => item.getTime() === next.getTime())) {
      days.push(next);
    }
  }

  return days.sort((a, b) => a.getTime() - b.getTime());
}

function attendanceValue(status: AttendanceStatus) {
  if (status === AttendanceStatus.ABSENT) return 0;
  return 1;
}

function buildStatuses(todayStatus: AttendanceStatus, targetPresentLikeDays: number) {
  const statuses = Array<AttendanceStatus>(20).fill(AttendanceStatus.ABSENT);
  statuses[19] = todayStatus;

  let remaining = targetPresentLikeDays - attendanceValue(todayStatus);
  for (let index = 0; index < 19 && remaining > 0; index += 1) {
    statuses[index] = index % 5 === 0 ? AttendanceStatus.WORK_FROM_HOME : AttendanceStatus.PRESENT;
    remaining -= 1;
  }

  return statuses;
}

function atTime(date: Date, hours: number, minutes: number) {
  const next = new Date(date);
  next.setUTCHours(hours, minutes, 0, 0);
  return next;
}

function notesFor(status: AttendanceStatus) {
  if (status === AttendanceStatus.ABSENT) return "Absent for the day.";
  if (status === AttendanceStatus.WORK_FROM_HOME) return "Remote work day.";
  if (status === AttendanceStatus.HALF_DAY) return "Half-day schedule.";
  if (status === AttendanceStatus.LATE) return "Late arrival recorded.";
  return null;
}

async function clearSeedData() {
  await prisma.department.updateMany({ data: { managerId: null } });
  await prisma.leaveRequest.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});
}

async function main() {
  await clearSeedData();

  await prisma.department.createMany({ data: departments });

  const admin = await prisma.user.create({
    data: {
      clerkId: "seed_admin",
      email: "admin@managewise.example",
      name: "ManageWise Admin",
      role: UserRole.ADMIN
    }
  });

  for (const employee of employees) {
    const department = await prisma.department.findUniqueOrThrow({
      where: { code: employee.departmentCode }
    });

    const user = await prisma.user.create({
      data: {
        ...employee.user,
        role: UserRole.EMPLOYEE
      }
    });

    await prisma.employee.create({
      data: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        jobTitle: employee.jobTitle,
        status: employee.status,
        salary: employee.salary,
        joinedAt: employee.joinedAt,
        departmentId: department.id,
        userId: user.id
      }
    });
  }

  for (const [departmentCode, managerEmail] of Object.entries(departmentManagers)) {
    const manager = await prisma.employee.findUniqueOrThrow({ where: { email: managerEmail } });
    await prisma.department.update({
      where: { code: departmentCode },
      data: { managerId: manager.id }
    });
  }

  const days = attendanceDays();
  const attendanceData = [];

  for (const [employeeIndex, employee] of employees.entries()) {
    const dbEmployee = await prisma.employee.findUniqueOrThrow({ where: { email: employee.email } });
    const statuses = buildStatuses(employee.todayStatus, employee.presentLikeTarget);

    for (const [dayIndex, date] of days.entries()) {
      const status = statuses[dayIndex];
      const hasTime = status !== AttendanceStatus.ABSENT;
      const checkInHour = status === AttendanceStatus.LATE ? 10 : 9;
      const checkInMinute = status === AttendanceStatus.LATE ? 30 : 5 + ((employeeIndex + dayIndex) % 20);
      const checkOutHour = status === AttendanceStatus.HALF_DAY ? 13 : 18;
      const checkOutMinute = status === AttendanceStatus.HALF_DAY ? 15 : 5 + ((employeeIndex * 2 + dayIndex) % 25);

      attendanceData.push({
        employeeId: dbEmployee.id,
        date,
        status,
        checkIn: hasTime ? atTime(date, checkInHour, checkInMinute) : null,
        checkOut: hasTime ? atTime(date, checkOutHour, checkOutMinute) : null,
        notes: notesFor(status)
      });
    }
  }

  await prisma.attendance.createMany({ data: attendanceData });

  for (const [id, employeeEmail, type, status, startDay, endDay, reason, reviewNote] of leaveRequests) {
    const employee = await prisma.employee.findUniqueOrThrow({ where: { email: employeeEmail } });

    await prisma.leaveRequest.create({
      data: {
        id,
        employeeId: employee.id,
        reviewerId: status === LeaveStatus.PENDING ? null : admin.id,
        type,
        status,
        startDate: currentMonthDay(startDay),
        endDate: currentMonthDay(endDay),
        reason,
        reviewNote,
        reviewedAt: status === LeaveStatus.PENDING ? null : currentMonthDay(Math.max(startDay - 2, 1))
      }
    });
  }

  console.log("Seeded 10 departments, 25 employees, 500 attendance records, and 10 leave requests.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
