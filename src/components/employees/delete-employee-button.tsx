"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteEmployee } from "@/actions/employees";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/toast";

export function DeleteEmployeeButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  function onConfirm() {
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
        if (result.ok) {
          setOpen(false);
          router.push("/employees");
        }
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
      <Button type="button" variant="ghost" size="icon" aria-label="Delete employee" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
      <ConfirmationDialog
        open={open}
        title="Delete employee?"
        description="This removes the employee record and related management context. This action cannot be undone."
        confirmLabel="Delete employee"
        destructive
        loading={isPending}
        onConfirm={onConfirm}
        onOpenChange={setOpen}
      />
    </>
  );
}
