import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getOptionalAccessContext } from "@/lib/authz";
import { UserRole } from "@prisma/client";



export default async function NotFound() {
  const context = await getOptionalAccessContext();
  const isAdmin = context?.role === UserRole.ADMIN;
  const redirectUrl = isAdmin ? "/dashboard" : "/attendance";
  const label = isAdmin ? "Back to dashboard" : "Back to attendance";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you are looking for does not exist.</p>
      <Button asChild className="mt-6">
        <Link href={redirectUrl}>{label}</Link>
      </Button>
    </main>
  );
}
