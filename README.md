# Employee Management System (EMS)

## Project Overview

The Employee Management System (EMS) is a modern, full-stack web application designed to streamline HR and administrative tasks. It provides a centralized platform for managing employee records, tracking attendance, handling leave requests, and organizing departmental structures. Built with a focus on user experience and performance, the application ensures secure and efficient management of workforce data.

## Features

- **Authentication & Authorization**: Secure user login and registration powered by Clerk, with role-based access control (Admin vs. Employee).
- **Dashboard Overview**: Get a bird's-eye view of employee statistics, attendance trends, and pending leave requests.
- **Employee Management**: Add, update, and manage employee profiles including their personal details, job titles, and status.
- **Department Organization**: Create and manage company departments, assign managers, and group employees.
- **Attendance Tracking**: Keep track of employee check-ins, check-outs, and daily attendance status.
- **Leave Management**: Employees can submit leave requests (Sick, Casual, Paid, etc.), and managers/admins can review, approve, or reject them.
- **Responsive Design**: A beautiful, fully responsive UI built with Tailwind CSS and shadcn/ui components.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Next.js Server Actions & API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Clerk
- **Form Handling & Validation**: React Hook Form, Zod
- **Language**: TypeScript

## Installation Steps

Follow these steps to set up the project locally:

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd ems_fullstack
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy the example environment file and fill in the required values.
   ```bash
   cp .env.example .env
   ```

4. **Set up the Database:**
   If you have Docker installed, you can spin up a local PostgreSQL instance:
   ```bash
   docker compose up -d
   ```
   Apply the database migrations and generate the Prisma client:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Seed the Database (Optional):**
   Populate the database with initial dummy data for testing.
   ```bash
   npm run db:seed
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

```env
# Database connection string (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ems_fullstack?schema=public"

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_key"
CLERK_SECRET_KEY="sk_test_your_key"

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

## Deployment Guide

This project is optimized for deployment on Vercel.

1. **Push your code to a GitHub repository.**
2. **Create a new project on Vercel** and import your repository.
3. **Configure Environment Variables:** In the Vercel project settings, add all the environment variables listed above. Ensure `DATABASE_URL` points to your production PostgreSQL database, e.g. Supabase, Neon, or Railway.
4. **Build Settings:** The included `vercel.json` runs `npm run vercel-build`, which generates Prisma Client, deploys Prisma migrations to the production database, and then builds Next.js.
5. **Database Migrations (Production):**
   If you do not deploy through Vercel, run `npm run prisma:deploy` before starting the production app so the login flow can create or update users safely.
6. **Deploy!**
