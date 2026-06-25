// app/(applicant)/applications/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApplication, updateApplication, submitApplication } from "@/lib/api/applications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Send, Loader2, Info } from "lucide-react";

const CATEGORIES = [
  { value: "general",     label: "General Request" },
  { value: "budget",      label: "Budget Approval" },
  { value: "leave",       label: "Leave Request"   },
  { value: "procurement", label: "Procurement"     },
  { value: "other",       label: "Other"           },
];

type StatusKey = "draft" | "submitted" | "under_review" | "approved" | "rejected";

const statusConfig: Record<StatusKey, { label: string; className: string }> = {
  draft:        { label: "Draft",        className: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300"         },
  submitted:    { label: "Submitted",    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"         },
  under_review: { label: "Under Review", className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" },
  approved:     { label: "Approved",     className: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"     },
  rejected:     { label: "Rejected",     className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"             },
};

const auditDotColor: Record<string, string> = {
  draft:        "bg-gray-400",
  submitted:    "bg-blue-500",
  under_review: "bg-yellow-500",
  approved:     "bg-green-500",
  rejected:     "bg-red-500",
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as StatusKey] ?? { label: status, className: "bg-gray-50 text-gray-700" };
  return <Badge className={config.className}>{config.label}</Badge>;
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [app, setApp]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState({ title: "", category: "", description: "" });
  const [dirty, setDirty]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplication(Number(id))
      .then((data) => {
        setApp(data);
        setForm({ title: data.title, category: data.category, description: data.description });
      })
      .catch(() => toast.error("Failed to load application."))
      .finally(() => setLoading(false));
  }, [id]);

  const isDraft = app?.status === "draft";

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty(true);
  };

  const handleDiscard = () => {
    if (!app) return;
    setForm({ title: app.title, category: app.category, description: app.description });
    setDirty(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateApplication(Number(id), form);
      setApp(updated);
      setDirty(false);
      toast.success("Changes saved.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const updated = await submitApplication(Number(id));
      setApp(updated);
      toast.success("Application submitted successfully.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-muted-foreground">Application not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        href="/applications"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        My Applications
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">{app.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StatusBadge status={app.status} />
            <span>·</span>
            <span>Updated {new Date(app.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {isDraft && (
          <Button onClick={handleSubmit} disabled={submitting || dirty}>
            {submitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              : <><Send className="mr-2 h-4 w-4" /> Submit</>
            }
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Main */}
        <div className="space-y-5">
          {isDraft && (
            <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
              <Info className="h-4 w-4 shrink-0" />
              This application is in draft. Edit and submit when ready.
            </div>
          )}

          <div className="rounded-lg border bg-card p-5 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Details</p>

            {isDraft ? (
              <>
                <div className="space-y-1">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="category">Category</Label>
                  <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    className="resize-none overflow-y-auto max-h-40"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>

                {dirty && (
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="outline" onClick={handleDiscard} disabled={saving}>
                      Discard
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                        : "Save changes"
                      }
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Title</p>
                  <p className="text-sm">{app.title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <p className="text-sm capitalize">{app.category.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm leading-relaxed">{app.description}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="rounded-lg border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">Info</p>
            <div className="space-y-0 divide-y divide-border">
              {[
                { label: "Status",       value: <StatusBadge status={app.status} /> },
                { label: "Owner",        value: app.owner.username                  },
                { label: "Created",      value: new Date(app.created_at).toLocaleDateString() },
                { label: "Last updated", value: new Date(app.updated_at).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">Activity</p>
            {app.audit_logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <div className="space-y-0 divide-y divide-border">
                {app.audit_logs.map((log) => (
                  <div key={log.id} className="flex gap-3 py-3">
                    <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${auditDotColor[log.to_status] ?? "bg-gray-400"}`} />
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{log.actor.username}</span>
                        {" "}moved to{" "}
                        <StatusBadge status={log.to_status} />
                      </p>
                      {log.comment && (
                        <p className="text-xs text-muted-foreground mt-0.5 italic">"{log.comment}"</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
