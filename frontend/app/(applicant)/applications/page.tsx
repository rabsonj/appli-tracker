"use client";

import { useEffect, useState } from "react";
import { columns } from "@/app/(applicant)/applications/columns";
import { DataTable } from "@/components/data-table";
import { fetchApplications, createApplication } from "@/lib/api/applications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Application } from "@/types";
import { ApplicationWritePayload, Category } from "@/types";

const STATUSES = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "general", label: "General Request" },
  { value: "budget", label: "Budget Approval" },
  { value: "leave", label: "Leave Request" },
  { value: "procurement", label: "Procurement" },
  { value: "other", label: "Other" },
];

const PAGE_SIZE = 10;
const EMPTY_FORM: ApplicationWritePayload = {
  title: "",
  category: "general",
  description: "",
};

/**
 * Renders the applications page.
 * @returns The applications page.
 */
export default function Page() {
  const [allData, setAllData] = useState<Application[]>([]);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ApplicationWritePayload>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Loads the applications.
   */
  const loadApplications = () => {
    fetchApplications().then(setAllData).catch(console.error);
  };

  useEffect(() => {
    loadApplications();
  }, []);
  useEffect(() => {
    setPage(1);
  }, [status]);

  const filtered =
    status === "all" ? allData : allData.filter((a) => a.status === status);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /**
   * Handles the cancellation of the creation of an application.
   */
  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setOpen(false);
  };

  /**
   * Handles the creation of an application.
   */
  const handleCreate = async () => {
    setCreating(true);
    setFieldErrors({});
    try {
      await createApplication(form);
      toast.success("Application created successfully.");
      setForm(EMPTY_FORM);
      setOpen(false);
      loadApplications();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
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
    <div className="container mx-auto py-10 space-y-4">
      <div className="flex items-center justify-between">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => setOpen(true)}>Create Application</Button>
      </div>

      <DataTable columns={columns} data={paginated} />

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) handleCancel();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Application</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a title"
                value={form.title}
                onChange={(e) => {
                  setForm((f) => ({ ...f, title: e.target.value }));
                  setFieldErrors((fe) => ({ ...fe, title: "" }));
                }}
              />
              {fieldErrors.title && (
                <p className="text-sm text-destructive">{fieldErrors.title}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, category: v as Category }));
                  setFieldErrors((fe) => ({ ...fe, category: "" }));
                }}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.category && (
                <p className="text-sm text-destructive">
                  {fieldErrors.category}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your application"
                rows={4}
                value={form.description}
                onChange={(e) => {
                  setForm((f) => ({ ...f, description: e.target.value }));
                  setFieldErrors((fe) => ({ ...fe, description: "" }));
                }}
              />
              {fieldErrors.description && (
                <p className="text-sm text-destructive">
                  {fieldErrors.description}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
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
    </div>
  );
}
