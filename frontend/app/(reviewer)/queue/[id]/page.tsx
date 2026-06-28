'use client';

import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Eye,
  Info,
  Loader2,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ActivitySection } from '@/components/applications/activity-section';
import { InfoSection } from '@/components/applications/info-section';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  approveApplication,
  fetchApplication,
  rejectApplication,
  returnForChanges,
  startReview,
} from '@/lib/api/applications';
import { Application } from '@/types';
import { formatAmount } from '@/utils/application';
import { getInitials } from '@/utils/user';

type ModalType = 'reject' | 'return' | null;

/**
 * Renders the application detail page for reviewers.
 * @returns The application detail page for reviewers.
 */
export default function ReviewerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [acting, setActing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchApplication(Number(id))
      .then(setApp)
      .catch(() => toast.error('Failed to load application.'))
      .finally(() => setLoading(false));
  }, [id]);

  /**
   * Closes the modal.
   */
  const closeModal = () => {
    setModal(null);
    setComment('');
    setCommentError('');
  };

  /**
   * Handles the start of a review.
   */
  const handleStartReview = async () => {
    setStarting(true);
    try {
      const updated = await startReview(Number(id));
      setApp(updated);
      toast.success('Review started.');
    } catch (err: unknown) {
      const error = err as { response: { data: { detail: string } } };
      toast.error(error?.response?.data?.detail ?? 'Failed to start review.');
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
      toast.success('Application approved.');
    } catch (err: unknown) {
      const error = err as { response: { data: { detail: string } } };
      toast.error(error?.response?.data?.detail ?? 'Failed to approve application.');
    } finally {
      setApproving(false);
    }
  };

  /**
   * Handles the confirmation of a modal.
   */
  const handleModalConfirm = async () => {
    if (!comment.trim()) {
      setCommentError('A comment is required.');
      return;
    }
    setActing(true);
    try {
      let updated;
      if (modal === 'reject') {
        updated = await rejectApplication(Number(id), { comment });
        toast.success('Application rejected.');
      } else {
        updated = await returnForChanges(Number(id), { comment });
        toast.success('Application returned for changes.');
      }
      setApp(updated);
      closeModal();
    } catch (err: unknown) {
      const error = err as { response: { data: { detail: string } } };
      toast.error(error?.response?.data?.detail ?? 'Action failed.');
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

  const isSubmitted = app.status === 'submitted';
  const isUnderReview = app.status === 'under_review';

  return (
    <div className="container mx-auto py-10 space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        href="/queue"
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
              {getInitials(app.owner)}
            </div>
            <span>{app.owner.username}</span>
            <span>·</span>
            <span>Updated {new Date(app.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {isSubmitted && (
            <Button
              className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-900"
              disabled={starting}
              variant="outline"
              onClick={handleStartReview}
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
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-900"
                disabled={approving}
                variant="outline"
                onClick={handleApprove}
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
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-900"
                variant="outline"
                onClick={() => setModal('reject')}
              >
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button variant="outline" onClick={() => setModal('return')}>
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
              <p className="text-sm capitalize">{app.category.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Amount</p>
              <p className="text-sm">ZMW {formatAmount(app.amount || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm leading-relaxed">{app.description}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <InfoSection app={app} />
          <ActivitySection app={app} />
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
              {modal === 'reject' ? 'Reject application' : 'Return for changes'}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            {modal === 'reject'
              ? 'Provide a reason. This will be visible to the applicant.'
              : 'Explain what the applicant needs to address before resubmitting.'}
          </p>

          <div className="space-y-1 py-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              className="resize-none"
              id="comment"
              placeholder={
                modal === 'reject'
                  ? 'e.g. Budget exceeds approved limits for this quarter.'
                  : 'e.g. Please attach the supporting cost breakdown document.'
              }
              rows={4}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (e.target.value.trim()) setCommentError('');
              }}
            />
            {commentError && <p className="text-sm text-destructive">{commentError}</p>}
          </div>

          <DialogFooter className="gap-2">
            <Button disabled={acting} variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              className={
                modal === 'reject'
                  ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300'
                  : ''
              }
              disabled={acting}
              variant={modal === 'reject' ? 'outline' : 'default'}
              onClick={handleModalConfirm}
            >
              {acting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {acting
                ? 'Confirming...'
                : modal === 'reject'
                  ? 'Confirm rejection'
                  : 'Confirm return'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
