"use client";

import { SignOutButton } from "@clerk/nextjs";
import { AlertTriangle, LogOut, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

type ConfirmSignOutButtonProps = {
  redirectUrl?: string;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  onRequestConfirm?: () => void;
};

export function ConfirmSignOutButton({
  redirectUrl = "/",
  label = "Sign out",
  variant = "ghost",
  className,
  onRequestConfirm
}: ConfirmSignOutButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={className}
        onClick={() => {
          onRequestConfirm?.();
          setOpen(true);
        }}
      >
        <LogOut className="h-4 w-4" />
        {label}
      </Button>
      {open ? (
        <SignOutConfirmDialog
          redirectUrl={redirectUrl}
          onOpenChange={setOpen}
        />
      ) : null}
    </>
  );
}

export function SignOutConfirmDialog({
  redirectUrl,
  onOpenChange
}: {
  redirectUrl: string;
  onOpenChange: (open: boolean) => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-foreground/35 backdrop-blur-sm animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border bg-card p-5 text-card-foreground shadow-soft animate-in fade-in zoom-in-95 slide-in-from-bottom-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold tracking-normal">Sign out?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              You will be signed out of this account. Continue only if you meant to leave this session.
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Stay signed in
          </Button>
          <SignOutButton redirectUrl={redirectUrl}>
            <Button type="button">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>,
    document.body
  );
}
