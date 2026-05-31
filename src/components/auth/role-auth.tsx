import { SignIn, SignUp } from "@clerk/nextjs";
import { BriefcaseBusiness, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { UserRole } from "@prisma/client";
import { ConfirmSignOutButton } from "@/components/auth/confirm-sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOptionalAccessContext } from "@/lib/authz";

type AuthRole = "admin" | "employee";

const roleConfig = {
  admin: {
    title: "Admin",
    description: "Access the full EMS dashboard, employees, attendance, and leave approvals.",
    role: UserRole.ADMIN,
    icon: ShieldCheck
  },
  employee: {
    title: "Employee",
    description: "Access your profile, attendance, and leave requests.",
    role: UserRole.EMPLOYEE,
    icon: BriefcaseBusiness
  }
} as const;

const clerkAppearance = {
  variables: {
    colorBackground: "hsl(var(--card))",
    colorText: "hsl(var(--card-foreground))",
    colorTextSecondary: "hsl(var(--muted-foreground))",
    colorPrimary: "hsl(var(--primary))",
    colorInputBackground: "hsl(var(--background))",
    colorInputText: "hsl(var(--foreground))",
    colorDanger: "hsl(var(--destructive))",
    borderRadius: "0.5rem"
  },
  elements: {
    cardBox: "border border-border bg-card text-card-foreground shadow-soft",
    headerTitle: "text-foreground",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton: "border-input bg-background text-foreground hover:bg-accent",
    formFieldInput: "border-input bg-background text-foreground",
    footerActionLink: "text-primary hover:text-primary/90"
  }
} as const;

export function RoleAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      {children}
    </main>
  );
}

export function AlreadyLoggedInNotice({
  user,
  role,
  profileHref
}: {
  user: { name: string | null; email: string };
  role: AuthRole;
  profileHref: string | null;
}) {
  const userName = user.name ?? user.email;
  const config = roleConfig[role];
  const Icon = config.icon;
  const redirectUrl = role === "admin" ? "/dashboard" : (profileHref ?? "/attendance");

  return (
    <RoleAuthShell>
      <Card className="w-full max-w-md border-primary/20 bg-card shadow-soft">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle>Already signed in</CardTitle>
          <div className="text-sm text-muted-foreground mt-1.5">
            You are currently signed in as <span className="font-semibold text-foreground">{userName}</span> (
            <Badge variant="outline" className="font-semibold uppercase text-xs">
              {role}
            </Badge>
            ).
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href={redirectUrl}>Continue to {role === "admin" ? "Dashboard" : "Employee Portal"}</Link>
          </Button>

          <ConfirmSignOutButton redirectUrl="/" label="Sign out & switch accounts" variant="outline" className="w-full" />

          <Button asChild variant="ghost" className="w-full">
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </RoleAuthShell>
  );
}

export async function RoleSelector({ mode }: { mode: "sign-in" | "sign-up" }) {
  const context = await getOptionalAccessContext();
  if (context?.user) {
    return (
      <AlreadyLoggedInNotice
        user={{ name: context.user.name, email: context.user.email }}
        role={context.role === UserRole.ADMIN ? "admin" : "employee"}
        profileHref={context.profileHref}
      />
    );
  }

  return (
    <RoleAuthShell>
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center">
          <Badge variant="outline" className="mb-3 bg-card">
            EMS access
          </Badge>
          <h1 className="text-2xl font-semibold md:text-3xl">{mode === "sign-in" ? "Choose login type" : "Create your account"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "sign-in" ? "Sign in with the account type assigned to you." : "First-time users can create a password-based account."}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(["admin", "employee"] as const).map((role) => {
            const config = roleConfig[role];
            const Icon = config.icon;
            return (
              <Card key={role}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{config.title}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/${role}/${mode}`}>{mode === "sign-in" ? `${config.title} login` : `${config.title} sign up`}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </RoleAuthShell>
  );
}

export async function RoleSignIn({ role }: { role: AuthRole }) {
  const context = await getOptionalAccessContext();
  if (context?.user) {
    return (
      <AlreadyLoggedInNotice
        user={{ name: context.user.name, email: context.user.email }}
        role={context.role === UserRole.ADMIN ? "admin" : "employee"}
        profileHref={context.profileHref}
      />
    );
  }

  const redirectUrl = role === "employee" ? "/employee/onboarding" : "/dashboard";

  return (
    <RoleAuthShell>
      <SignIn signUpUrl={`/${role}/sign-up`} forceRedirectUrl={redirectUrl} appearance={clerkAppearance} />
    </RoleAuthShell>
  );
}

export function AdminAccessNotice({ type }: { type: "admin-exists" | "admin-only" | "employee-only" }) {
  const isEmployeeOnly = type === "employee-only";
  const Icon = isEmployeeOnly ? BriefcaseBusiness : ShieldCheck;
  const signoutRedirectUrl = isEmployeeOnly ? "/employee/sign-in" : "/admin/sign-in";

  return (
    <RoleAuthShell>
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle>
            {type === "admin-exists"
              ? "Admin is already registered"
              : type === "admin-only"
              ? "Admin access required"
              : "Employee access required"}
          </CardTitle>
          <div className="text-sm text-muted-foreground mt-1.5">
            {type === "admin-exists"
              ? "This demo workspace allows one admin account. Use the existing admin account, or delete it before creating another one."
              : type === "admin-only"
              ? "The account you used is not the registered admin for this workspace."
              : "The account you used is registered as an Admin. Admin accounts cannot log in to the Employee portal."}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {isEmployeeOnly ? (
            <Button asChild>
              <Link href="/dashboard">Go to Admin Dashboard</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/admin/sign-in">Admin login</Link>
            </Button>
          )}

          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>

          {type !== "admin-exists" ? (
            <ConfirmSignOutButton redirectUrl={signoutRedirectUrl} label="Sign out of this account" className="w-full" />
          ) : null}
        </CardContent>
      </Card>
    </RoleAuthShell>
  );
}

export async function RoleSignUp({ role, disabledReason }: { role: AuthRole; disabledReason?: "admin-exists" }) {
  const context = await getOptionalAccessContext();
  if (context?.user) {
    return (
      <AlreadyLoggedInNotice
        user={{ name: context.user.name, email: context.user.email }}
        role={context.role === UserRole.ADMIN ? "admin" : "employee"}
        profileHref={context.profileHref}
      />
    );
  }

  const config = roleConfig[role];
  const redirectUrl = role === "employee" ? "/employee/onboarding" : "/dashboard";

  if (disabledReason === "admin-exists") {
    return <AdminAccessNotice type="admin-exists" />;
  }

  return (
    <RoleAuthShell>
      <SignUp
        signInUrl={`/${role}/sign-in`}
        forceRedirectUrl={redirectUrl}
        appearance={clerkAppearance}
        unsafeMetadata={{
          role: config.role
        }}
      />
    </RoleAuthShell>
  );
}
