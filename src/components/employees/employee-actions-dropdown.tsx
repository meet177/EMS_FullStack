"use client";

import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { deleteEmployee } from "@/actions/employees";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";

export function EmployeeActionsDropdown({ id }: { id: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function onConfirmDelete() {
    const formData = new FormData();
    formData.set("id", id);

    startTransition(async () => {
      try {
        const result = await deleteEmployee(formData);
        toast({
          variant: result.ok ? "success" : "error",
          title: result.ok ? "Employee deleted" : "Employee not deleted",
          description: result.message
        });
        if (result.ok) setConfirmOpen(false);
      } catch {
        toast({
          variant: "error",
          title: "Request failed",
          description: "The employee could not be deleted. Please check your connection and try again."
        });
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open employee actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/employees/${id}`}>
              <Eye className="h-4 w-4" />
              View details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/employees/${id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit employee
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button type="button" className="w-full text-destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete employee
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmationDialog
        open={confirmOpen}
        title="Delete employee?"
        description="This removes the employee record and related management context. This action cannot be undone."
        confirmLabel="Delete employee"
        destructive
        loading={isPending}
        onConfirm={onConfirmDelete}
        onOpenChange={setConfirmOpen}
      />
    </>
  );
}
