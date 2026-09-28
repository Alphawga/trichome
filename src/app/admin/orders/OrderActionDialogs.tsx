"use client";

import type { OrderStatus } from "@prisma/client";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUS_LABELS } from "./order-display";

const editableStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "READY_FOR_PICKUP",
  "PICKED_UP",
  "DELIVERED",
  "RETURNED",
];

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  isPending: boolean;
  canSubmit: boolean;
  destructive?: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

function ActionDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  isPending,
  canSubmit,
  destructive = false,
  onSubmit,
  children,
}: ActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {children}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={destructive ? "destructive" : "default"}
              disabled={!canSubmit || isPending}
            >
              {isPending ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: OrderStatus;
  isPending: boolean;
  onSubmit: (status: OrderStatus, notes?: string) => void;
}

export function UpdateStatusDialog({
  open,
  onOpenChange,
  currentStatus,
  isPending,
  onSubmit,
}: UpdateStatusDialogProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setStatus(currentStatus);
      setNotes("");
    }
  }, [currentStatus, open]);

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Update order status"
      description={`Current status: ${ORDER_STATUS_LABELS[currentStatus]}. Choose a new operational state.`}
      submitLabel="Update status"
      isPending={isPending}
      canSubmit={status !== currentStatus}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(status, notes.trim() || undefined);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="order-status">New status</Label>
        <select
          id="order-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus)}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#40702A] focus:ring-2 focus:ring-[#40702A]/20"
        >
          {editableStatuses.map((option) => (
            <option key={option} value={option}>
              {ORDER_STATUS_LABELS[option]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status-note">Note (optional)</Label>
        <Textarea
          id="status-note"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Add context for this status change"
          rows={3}
        />
      </div>
    </ActionDialog>
  );
}

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSubmit: (note: string) => void;
}

export function AddNoteDialog({
  open,
  onOpenChange,
  isPending,
  onSubmit,
}: AddNoteDialogProps) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) setNote("");
  }, [open]);

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add internal note"
      description="Record context for staff in the order activity timeline."
      submitLabel="Add note"
      isPending={isPending}
      canSubmit={note.trim().length > 0}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(note.trim());
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="internal-note">Internal note</Label>
        <Textarea
          id="internal-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Write a note for the team"
          rows={4}
        />
      </div>
    </ActionDialog>
  );
}

interface TrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTracking: string;
  isPending: boolean;
  onSubmit: (trackingNumber: string) => void;
}

export function TrackingDialog({
  open,
  onOpenChange,
  currentTracking,
  isPending,
  onSubmit,
}: TrackingDialogProps) {
  const [trackingNumber, setTrackingNumber] = useState(currentTracking);

  useEffect(() => {
    if (open) setTrackingNumber(currentTracking);
  }, [currentTracking, open]);

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={currentTracking ? "Edit tracking number" : "Add tracking number"}
      description="Save the carrier tracking reference for this order."
      submitLabel="Save tracking"
      isPending={isPending}
      canSubmit={
        trackingNumber.trim().length > 0 &&
        trackingNumber.trim() !== currentTracking
      }
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(trackingNumber.trim());
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="tracking-number">Tracking number</Label>
        <Input
          id="tracking-number"
          value={trackingNumber}
          onChange={(event) => setTrackingNumber(event.target.value)}
          placeholder="Enter tracking number"
          autoComplete="off"
        />
      </div>
    </ActionDialog>
  );
}

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  isPending: boolean;
  onSubmit: (reason: string) => void;
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  orderNumber,
  isPending,
  onSubmit,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel order"
      description={`Cancel order #${orderNumber}. Inventory will be restored.`}
      submitLabel="Cancel order"
      isPending={isPending}
      canSubmit={reason.trim().length > 0}
      destructive
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(reason.trim());
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="cancellation-reason">Cancellation reason</Label>
        <Textarea
          id="cancellation-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Explain why this order is being cancelled"
          rows={4}
          required
        />
      </div>
    </ActionDialog>
  );
}
