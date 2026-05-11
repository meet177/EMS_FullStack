"use client";

import { useUser } from "@clerk/nextjs";
import { LogOut, Trash2, UserCircle2, X } from "lucide-react";
import { useState, useTransition, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { deleteCurrentAccount } from "@/actions/account";
import { SignOutConfirmDialog } from "@/components/auth/confirm-sign-out-button";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/toast";

export function UserMenu({
  clerkEnabled,
  userName,
  userEmail
}: {
  clerkEnabled: boolean;
  userName?: string;
  userEmail?: string;
}) {
  if (!clerkEnabled) {
    return <MockUserMenu userName={userName ?? "Demo User"} userEmail={userEmail ?? ""} />;
  }

  return <AuthenticatedUserMenu />;
}

function MockUserMenu({ userName, userEmail }: { userName: string; userEmail: string }) {
  const { toast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  function handleDeleteAccount() {
    startTransition(async () => {
      try {
        const result = await deleteCurrentAccount();

        if (!result.ok) {
          toast({ title: "Account not deleted", description: result.message, variant: "error" });
          return;
        }

        toast({ title: "Account deleted", description: result.message, variant: "success" });
        window.location.assign("/");
      } catch {
        toast({
          title: "Request failed",
          description: "The account could not be deleted. Please check your connection and try again.",
          variant: "error"
        });
      }
    });
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="outline" size="icon" aria-label="Open profile menu" className="overflow-hidden" onClick={() => setProfileOpen((prev) => !prev)}>
        <UserCircle2 className="h-4 w-4" />
      </Button>

      {profileOpen ? (
        <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-xs rounded-lg border bg-card p-4 text-card-foreground shadow-soft animate-in fade-in zoom-in-95 slide-in-from-top-2">
            <div className="flex items-start gap-3 border-b pb-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary/10 text-primary">
                <UserCircle2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{userName}</p>
                <p className="mt-1 break-all text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8" onClick={() => setProfileOpen(false)} aria-label="Close profile menu">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-3 grid gap-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setProfileOpen(false);
                  setSignOutConfirmOpen(true);
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  setProfileOpen(false);
                  setConfirmOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </Button>
            </div>
          </div>
      ) : null}

      {signOutConfirmOpen ? (
        <SignOutConfirmDialog
  redirectUrl="/"
  onOpenChange={setSignOutConfirmOpen}
/>
      ) : null}

      <ConfirmationDialog
        open={confirmOpen}
        title="Delete account permanently?"
        description="This will permanently delete your local mock session and erase database records. Employee records, attendance, and leave data stay in the database for testing."
        confirmLabel="Delete account"
        destructive
        loading={isPending}
        onConfirm={handleDeleteAccount}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
}

function AuthenticatedUserMenu() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = isLoaded ? user?.fullName ?? user?.username ?? "My profile" : "Loading";
  const email = user?.primaryEmailAddress?.emailAddress ?? "Signed in";

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  function handleDeleteAccount() {
    startTransition(async () => {
      try {
        const result = await deleteCurrentAccount();

        if (!result.ok) {
          toast({ title: "Account not deleted", description: result.message, variant: "error" });
          return;
        }

        toast({ title: "Account deleted", description: result.message, variant: "success" });
        window.location.assign("/");
      } catch {
        toast({
          title: "Request failed",
          description: "The account could not be deleted. Please check your connection and try again.",
          variant: "error"
        });
      }
    });
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="outline" size="icon" aria-label="Open profile menu" className="overflow-hidden" onClick={() => setProfileOpen((prev) => !prev)}>
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserCircle2 className="h-4 w-4" />
        )}
      </Button>

      {profileOpen ? (
        <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-xs rounded-lg border bg-card p-4 text-card-foreground shadow-soft animate-in fade-in zoom-in-95 slide-in-from-top-2">
            <div className="flex items-start gap-3 border-b pb-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary/10 text-primary">
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserCircle2 className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{displayName}</p>
                <p className="mt-1 break-all text-xs text-muted-foreground">{email}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8" onClick={() => setProfileOpen(false)} aria-label="Close profile menu">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-3 grid gap-2">
              <Button
                type="button"
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  setProfileOpen(false);
                  setSignOutConfirmOpen(true);
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  setProfileOpen(false);
                  setConfirmOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </Button>
            </div>
          </div>
      ) : null}

      {signOutConfirmOpen ? (
<SignOutConfirmDialog
  redirectUrl="/sign-in"
  onOpenChange={setSignOutConfirmOpen}
/>      ) : null}

      <ConfirmationDialog
        open={confirmOpen}
        title="Delete account permanently?"
        description="This will permanently delete your Clerk login account and unlink it from this EMS workspace. Employee records, attendance, and leave data stay in the demo database for future testing."
        confirmLabel="Delete account"
        destructive
        loading={isPending}
        onConfirm={handleDeleteAccount}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
}
