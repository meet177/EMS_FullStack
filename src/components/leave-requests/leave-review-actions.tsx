"use client";

import { Check, Loader2, X } from "lucide-react";
import { useState, useTransition } from "react";

import { approveLeaveRequest, rejectLeaveRequest } from "@/actions/leave-requests";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function LeaveReviewActions({ id, disabled }: { id: string; disabled: boolean }) {
  const [reviewNote, setReviewNote] = useState("");
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function submitReview(action: "approve" | "reject") {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("reviewNote", reviewNote);

    startTransition(async () => {
      try {
        const result = action === "approve" ? await approveLeaveRequest(formData) : await rejectLeaveRequest(formData);
        toast({
          variant: result.ok ? "success" : "error",
          title: result.ok ? (action === "approve" ? "Leave approved" : "Leave rejected") : "Review not saved",
          description: result.message
        });
        if (result.ok) setDialogAction(null);
      } catch {
        toast({
          variant: "error",
          title: "Request failed",
          description: "The review could not be saved. Please check your connection and try again."
        });
      }
    });
  }

  return (
    <>
      <div className="grid gap-2 md:grid-cols-[minmax(12rem,1fr)_auto_auto]">
        <Input
          value={reviewNote}
          onChange={(event) => setReviewNote(event.target.value)}
          placeholder="Optional review note"
          disabled={disabled || isPending}
          maxLength={300}
        />
        <Button type="button" size="sm" disabled={disabled || isPending} onClick={() => setDialogAction("approve")}>
          {isPending && dialogAction === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Approve
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={disabled || isPending} onClick={() => setDialogAction("reject")}>
          {isPending && dialogAction === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          Reject
        </Button>
      </div>
      <ConfirmationDialog
        open={dialogAction !== null}
        title={dialogAction === "approve" ? "Approve leave request?" : "Reject leave request?"}
        description={
          dialogAction === "approve"
            ? "The employee will be marked as approved for the selected leave dates."
            : "The employee will see this request as rejected. Add a review note if context is needed."
        }
        confirmLabel={dialogAction === "approve" ? "Approve request" : "Reject request"}
        destructive={dialogAction === "reject"}
        loading={isPending}
        onConfirm={() => {
          if (dialogAction) submitReview(dialogAction);
        }}
        onOpenChange={(open) => setDialogAction(open ? dialogAction : null)}
      />
    </>
  );
}
