// app/(reviewer)/queue/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  fetchApplication,
  startReview,
  approveApplication,
  rejectApplication,
  returnForChanges,
} from "@/lib/api/applications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  Loader2,
  Info,
  Clock,
} from "lucide-react";
import { Application, ApplicationStatusEnum } from "@/types";

const statusConfig: Record<
  ApplicationStatusEnum,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  },
  submitted: {
    label: "Submitted",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  under_review: {
    label: "Under Review",
    className:
      "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  },
  approved: {
    label: "Approved",
    className:
      "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
  returned_for_changes: {
    label: "Returned for Changes",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
};

const auditDotColor: Record<string, string> = {
  draft: "bg-gray-400",
  submitted: "bg-blue-500",
  under_review: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  returned_for_changes: "bg-red-500",
};

/**
 * Renders a status badge.
 * @param status - The status to render.
 * @returns The status badge.
 */
function StatusBadge({ status }: { status: ApplicationStatusEnum }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-gray-50 text-gray-700",
  };
  return <Badge className={config.className}>{config.label}</Badge>;
}

/**
 * Returns the initials of a username.
 * @param username - The username.
 * @returns The initials of the username.
 */
function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

type ModalType = "reject" | "return" | null;

/**
 * Renders the application detail page for reviewers.
 * @returns The application detail page for reviewers.
 */
export default function ReviewerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [acting, setActing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchApplication(Number(id))
      .then(setApp)
      .catch(() => toast.error("Failed to load application."))
      .finally(() => setLoading(false));
  }, [id]);

  /**
   * Closes the modal.
   */
  const closeModal = () => {
    setModal(null);
    setComment("");
    setCommentError("");
  };

  /**
   * Handles the start of a review.
   */
  const handleStartReview = async () => {
    setStarting(true);
    try {
      const updated = await startReview(Number(id));
      setApp(updated);
      toast.success("Review started.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Failed to start review.");
    } finally {
      setStarting(false);
    }
  };

  /**
   * Handles the approval of an application.
   */
  const handleApprove = async () => {
    setApproving(true);
    try {
      const updated = await approveApplication(Number(id));
      setApp(updated);
      toast.success("Application approved.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ?? "Failed to approve application."
      );
    } finally {
      setApproving(false);
    }
  };

  /**
   * Handles the confirmation of a modal.
   */
  const handleModalConfirm = async () => {
    if (!comment.trim()) {
      setCommentError("A comment is required.");
      return;
    }
    setActing(true);
    try {
      let updated;
      if (modal === "reject") {
        updated = await rejectApplication(Number(id), { comment });
        toast.success("Application rejected.");
      } else {
        updated = await returnForChanges(Number(id), { comment });
        toast.success("Application returned for changes.");
      }
      setApp(updated);
      closeModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Action failed.");
    } finally {
      setActing(false);
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

  const isSubmitted = app.status === "submitted";
  const isUnderReview = app.status === "under_review";

  return (
    <div className="container mx-auto py-10 space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        href="/queue"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Review Queue
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">{app.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StatusBadge status={app.status} />
            <span>·</span>
            <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center text-[10px] font-medium">
              {getInitials(app.owner.username)}
            </div>
            <span>{app.owner.username}</span>
            <span>·</span>
            <span>
              Updated {new Date(app.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {isSubmitted && (
            <Button
              variant="outline"
              className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-900"
              onClick={handleStartReview}
              disabled={starting}
            >
              {starting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" /> Start Review
                </>
              )}
            </Button>
          )}

          {isUnderReview && (
            <>
              <Button
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-900"
                onClick={handleApprove}
                disabled={approving}
              >
                {approving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-900"
                onClick={() => setModal("reject")}
              >
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button variant="outline" onClick={() => setModal("return")}>
                <RotateCcw className="mr-2 h-4 w-4" /> Return for changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Main */}
        <div className="space-y-5">
          {isSubmitted && (
            <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
              <Info className="h-4 w-4 shrink-0" />
              This application is awaiting review. Start reviewing to claim it.
            </div>
          )}
          {isUnderReview && (
            <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
              <Clock className="h-4 w-4 shrink-0" />
              You are currently reviewing this application.
            </div>
          )}

          <div className="rounded-lg border bg-card p-5 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Details
            </p>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Title</p>
              <p className="text-sm">{app.title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Category</p>
              <p className="text-sm capitalize">
                {app.category.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm leading-relaxed">{app.description}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="rounded-lg border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
              Info
            </p>
            <div className="space-y-0 divide-y divide-border">
              {[
                {
                  label: "Status",
                  value: <StatusBadge status={app.status} />,
                },
                { label: "Owner", value: app.owner.username },
                {
                  label: "Created",
                  value: new Date(app.created_at).toLocaleDateString(),
                },
                {
                  label: "Last updated",
                  value: new Date(app.updated_at).toLocaleDateString(),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
              Activity
            </p>
            {app.audit_logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <div className="space-y-0 divide-y divide-border">
                {app.audit_logs.map((log) => (
                  <div key={log.id} className="flex gap-3 py-3">
                    <div
                      className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                        auditDotColor[log.to_status] ?? "bg-gray-400"
                      }`}
                    />
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{log.actor.username}</span>{" "}
                        moved to <StatusBadge status={log.to_status} />
                      </p>
                      {log.comment && (
                        <p className="text-xs text-muted-foreground mt-0.5 italic">
                          &quot;{log.comment}&quot;
                        </p>
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

      {/* Reject / Return modal */}
      <Dialog
        open={modal !== null}
        onOpenChange={(v) => {
          if (!v) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modal === "reject"
                ? "Reject application"
                : "Return for changes"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            {modal === "reject"
              ? "Provide a reason. This will be visible to the applicant."
              : "Explain what the applicant needs to address before resubmitting."}
          </p>

          <div className="space-y-1 py-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              rows={4}
              className="resize-none"
              placeholder={
                modal === "reject"
                  ? "e.g. Budget exceeds approved limits for this quarter."
                  : "e.g. Please attach the supporting cost breakdown document."
              }
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (e.target.value.trim()) setCommentError("");
              }}
            />
            {commentError && (
              <p className="text-sm text-destructive">{commentError}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeModal} disabled={acting}>
              Cancel
            </Button>
            <Button
              onClick={handleModalConfirm}
              disabled={acting}
              className={
                modal === "reject"
                  ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300"
                  : ""
              }
              variant={modal === "reject" ? "outline" : "default"}
            >
              {acting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {acting
                ? "Confirming..."
                : modal === "reject"
                ? "Confirm rejection"
                : "Confirm return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
