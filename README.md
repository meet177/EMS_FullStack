# ManageWise EMS

ManageWise EMS is a full-stack Employee Management System for managing employees, departments, attendance, leave requests, and role-based access for admins and employees. It is built with Next.js App Router, Clerk authentication, Prisma, PostgreSQL, and a responsive Tailwind UI.

## Live Demo

Try the deployed app: [https://managewise-ems.vercel.app/](https://managewise-ems.vercel.app/)

## Features

- **Role-based authentication**
  - Clerk-powered sign in and sign up.
  - Separate admin and employee entry points.
  - Admin-only routes for workforce management.
  - Employee-only profile, attendance, and leave flows.

- **Admin dashboard**
  - Workforce summary cards for total employees, active employees, departments, and pending leave requests.
  - Department headcount chart.
  - Employee status chart for active and on-leave employees.
  - Recent hires and department distribution overview.

- **Employee directory**
  - Paginated employee table.
  - Prefix-prioritized search by name, email, role, and department.
  - Department filtering.
  - Sortable columns for name, department, role, status, salary, and joined date.
  - Employee detail pages with profile, salary, department, and status information.
  - Admin employee edit actions.

- **Employee onboarding**
  - Employees can create their profile after sign up.
  - Employee accounts are linked to their Clerk user.
  - Existing employee records can be linked by matching email.

- **Attendance management**
  - Employees can mark daily attendance.
  - Admins can view daily attendance reports by date and department.
  - Monthly attendance percentage tracking.
  - Attendance statuses include Present, Absent, Late, Half Day, and Work From Home.
  - Employee yearly attendance overview.

- **Leave management**
  - Employees can submit leave requests.
  - Admins can review, approve, or reject pending requests.
  - Leave types include Casual, Sick, Paid, Unpaid, Maternity, Paternity, and Bereavement.
  - Employees can view monthly and yearly approved leave totals.
  - Admins can see approved leave counts while reviewing requests.

- **Department management**
  - Seeded departments with managers.
  - Department headcount reporting.
  - Employee-to-department assignment.

- **Account actions**
  - Sign out confirmation.
  - Account deletion action for linked Clerk users and local records.

- **Production-ready deployment setup**
  - Vercel build command included.
  - Prisma Client generated during deployment.
  - Prisma migrations deployed before the Next.js build.
  - Standard `@prisma/client` generation for Vercel/Linux compatibility.

## Tech Stack

- **Framework:** Next.js 15 App Router
- **UI:** React 19, Tailwind CSS, shadcn-style components
- **Charts:** Recharts
- **Authentication:** Clerk
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Language:** TypeScript
- **Deployment:** Vercel

## Project Structure

```text
ems_fullstack/
  prisma/
    migrations/          Database migrations
    schema.prisma        Prisma schema
    seed.ts              Demo data seed script
  src/
    actions/             Server actions
    app/                 Next.js App Router pages and API routes
    components/          UI, auth, dashboard, employee, attendance, leave components
    lib/                 Auth, database helpers, validation, utilities
  vercel.json            Vercel build configuration
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env` from the example file:

```bash
cp .env.example .env
```

Required variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ems_fullstack?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/ems_fullstack?schema=public"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_key"
CLERK_SECRET_KEY="sk_test_your_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

For production, `DATABASE_URL` must point to a hosted PostgreSQL database such as Neon, Supabase, Railway, or another cloud Postgres provider. Do not use `localhost` on Vercel. If your provider has both pooled and direct URLs, use the pooled URL for `DATABASE_URL` and the direct URL for `DIRECT_URL`.

### 3. Start PostgreSQL locally

If Docker is available:

```bash
docker compose up -d
```

### 4. Generate Prisma Client and migrate

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Seed demo data

```bash
npm run db:seed
```

The seed script resets the demo data tables and creates:

- 10 departments
- 25 employees
- 500 attendance records
- 10 leave requests
- 5 employees marked Present today
- 5 employees marked Absent today
- 5 employees marked Work From Home today
- 5 employees marked Half Day today
- 5 employees marked Late today
- 5 employees on leave
- 5 pending leave requests
- 3 approved leave requests
- 2 rejected leave requests with review reasons

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev              # Start local development server
npm run build            # Build production Next.js app
npm run start            # Start production server
npm run lint             # Run Next.js lint
npm run vercel-build     # Generate Prisma, deploy migrations, build Next.js
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Create/apply local Prisma migrations
npm run prisma:deploy    # Apply migrations in production
npm run prisma:status    # Check migration status
npm run prisma:studio    # Open Prisma Studio
npm run db:seed          # Seed demo data
```

## Deployment

This project is configured for Vercel through `vercel.json`.

Vercel runs:

```bash
npm run vercel-build
```

That command runs:

```bash
prisma generate && prisma migrate deploy && next build
```

### Vercel environment variables

Set these in Vercel Project Settings:

```env
DATABASE_URL="postgresql://user:password@pooled-host/database?sslmode=require"
DIRECT_URL="postgresql://user:password@direct-host/database?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_or_pk_test_key"
CLERK_SECRET_KEY="sk_live_or_sk_test_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

Important deployment notes:

- The Vercel project root should be `ems_fullstack`.
- `DATABASE_URL` must be a hosted PostgreSQL URL, not `localhost`.
- For Neon, `DATABASE_URL` should be the pooled connection string and `DIRECT_URL` should be the direct connection string. Prisma migrations use `DIRECT_URL`, which avoids migration lock timeouts on the pooler.
- Use Clerk production keys for a production Clerk instance.
- In Clerk, configure the production domain for your deployed site, for example `managewise-ems.vercel.app`.
- After changing environment variables, redeploy the Vercel project.

## Database Notes

The Prisma schema models:

- `User`
- `Department`
- `Employee`
- `Attendance`
- `LeaveRequest`

The app uses standard `@prisma/client` generation. Generated Prisma files are not committed to the repository.

## Demo Data Notes

The seed script is intentionally strict. It clears existing employee, attendance, leave, user, and department records before inserting the demo dataset. Run it only on a development/demo database, not on a database containing real production data.

## License

This project is private and intended for portfolio/demo use.
