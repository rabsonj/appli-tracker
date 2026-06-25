"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createApplication } from "@/lib/api/applications";
import { ApplicationWritePayload, Category } from "@/types";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "general", label: "General Request" },
  { value: "budget", label: "Budget Approval" },
  { value: "leave", label: "Leave Request" },
  { value: "procurement", label: "Procurement" },
  { value: "other", label: "Other" },
];

const EMPTY_FORM: ApplicationWritePayload = {
  title: "",
  category: "general",
  description: "",
  amount: undefined,
};

interface CreateApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateApplicationDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateApplicationDialogProps) {
  const [form, setForm] = useState<ApplicationWritePayload>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    onOpenChange(false);
  };

  const handleCreate = async () => {
    setCreating(true);
    setFieldErrors({});

    try {
      await createApplication(form);
      toast.success("Application created successfully.");
      setForm(EMPTY_FORM);
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const detail =
        (err as { response: { data: { detail: string } } })?.response?.data
          ?.detail;

      if (detail && typeof detail === "object") {
        const errors: Record<string, string> = {};
        for (const [field, messages] of Object.entries(detail)) {
          errors[field] = Array.isArray(messages)
            ? (messages[0] as string)
            : String(messages);
        }
        setFieldErrors(errors);
      } else {
        toast.error(detail ?? "Failed to create application.");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Application</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            {fieldErrors.title && (
              <p className="text-sm text-destructive">{fieldErrors.title}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label htmlFor="amount">Amount (optional)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={form.amount ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setForm((f) => ({
                  ...f,
                  amount: value === "" ? undefined : Number(value),
                }));
              }}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {creating ? "Creating..." : "Create Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
