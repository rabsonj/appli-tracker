'use client';

import { ArrowLeft, Info, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ApplicationDetailSkeleton } from '@/components/application-detail-skeleton';
import { ApplicationNotFound } from '@/components/application-not-found';
import { ActivitySection } from '@/components/applications/activity-section';
import { InfoSection } from '@/components/applications/info-section';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { fetchApplication, submitApplication, updateApplication } from '@/lib/api/applications';
import { Application, ApplicationCategoryEnum, PatchedApplication } from '@/types';
import { formatAmount, isReturnedForChanges } from '@/utils/application';

const CATEGORIES: { value: ApplicationCategoryEnum; label: string }[] = [
  { value: 'general', label: 'General Request' },
  { value: 'budget', label: 'Budget Approval' },
  { value: 'leave', label: 'Leave Request' },
  { value: 'procurement', label: 'Procurement' },
  { value: 'other', label: 'Other' },
];

/**
 * Renders the application detail page.
 * @returns The application detail page.
 */
export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<PatchedApplication>({
    title: '',
    category: 'general',
    description: '',
    amount: undefined,
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchApplication(Number(id))
      .then((data) => {
        setApp(data);
        setForm({
          title: data.title,
          category: data.category,
          description: data.description,
          amount: data.amount,
        });
      })
      .catch(() => toast.error('Failed to load application.'))
      .finally(() => setLoading(false));
  }, [id]);

  const returnedForChanges = isReturnedForChanges(app as Application);
  const isDraft = app?.status === 'draft';

  /**
   * Handles a change in a form field.
   * @param field - The field that changed.
   * @param value - The new value of the field.
   */
  const handleChange = (field: string, value: string | undefined | number) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty(true);
  };

  /**
   * Discards the changes made to the form.
   */
  const handleDiscard = () => {
    if (!app) return;
    setForm({
      title: app.title,
      category: app.category,
      description: app.description,
      amount: app.amount,
    });
    setDirty(false);
    setFieldErrors({});
  };

  /**
   * Saves the changes made to the form.
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateApplication(Number(id), form);
      setApp(updated);
      setDirty(false);
      toast.success('Changes saved.');
      setFieldErrors({});
    } catch (err: unknown) {
      const detail = (err as { response: { data: { detail: string } } })?.response?.data?.detail;
      if (detail && typeof detail === 'object') {
        const errors: Record<string, string> = {};
        for (const [field, messages] of Object.entries(detail)) {
          errors[field] = Array.isArray(messages) ? (messages[0] as string) : String(messages);
        }
        setFieldErrors(errors);
      } else {
        toast.error(detail ?? 'Failed to save changes.');
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * Submits the application.
   */
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const updated = await submitApplication(Number(id));
      setApp(updated);
      toast.success('Application submitted successfully.');
    } catch (err: unknown) {
      const error = err as { response: { data: { detail: string } } };
      toast.error(error?.response?.data?.detail ?? 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading === true) {
    return <ApplicationDetailSkeleton />;
  }

  if (!app) {
    return <ApplicationNotFound backLink="/applications" backLinkText="My Applications" />;
  }

  return (
    <div className="container mx-auto py-10 space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        href="/applications"
      >
        <ArrowLeft className="h-4 w-4" />
        My Applications
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">{app.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StatusBadge
              status={returnedForChanges === true ? 'returned_for_changes' : app.status}
            />
            <span>·</span>
            <span>Updated {new Date(app.updated_at).toLocaleString()}</span>
          </div>
        </div>

        {isDraft === true && (
          <Button disabled={submitting || dirty} onClick={handleSubmit}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Submit
              </>
            )}
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Main */}
        <div className="space-y-5">
          {isDraft === true && (
            <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
              <Info className="h-4 w-4 shrink-0" />
              {returnedForChanges === true
                ? `${app.audit_logs[0].actor.first_name} ${app.audit_logs[0].actor.last_name}
                    requested changes. Please edit the application to address the requested changes and submit the application.
                  `
                : 'This application is in draft. Edit and submit when ready.'}
            </div>
          )}

          {app.status === 'rejected' && (
            <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
              <Info className="h-4 w-4 shrink-0" />
              {app.audit_logs[0].actor.first_name} {app.audit_logs[0].actor.last_name} rejected this
              application. Check the Activity section to see their comments.
            </div>
          )}

          <div className="rounded-lg border bg-card p-5 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Details
            </p>

            {isDraft === true ? (
              <>
                <div className="space-y-1">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                  />
                  {fieldErrors.title && (
                    <p className="text-sm text-destructive">{fieldErrors.title}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="category">Category</Label>
                  <Select value={form.category} onValueChange={(v) => handleChange('category', v)}>
                    <SelectTrigger id="category">
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

                <div className="space-y-1">
                  <Label htmlFor="amount">Amount (ZMW)</Label>
                  <Input
                    id="amount"
                    placeholder="Enter amount"
                    type="number"
                    value={form.amount ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange('amount', value === '' ? undefined : Number(value));
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    className="resize-none overflow-y-auto max-h-40"
                    id="description"
                    rows={4}
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>

                {dirty && (
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button disabled={saving} variant="outline" onClick={handleDiscard}>
                      Discard
                    </Button>
                    <Button disabled={saving} onClick={handleSave}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        'Save changes'
                      )}
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
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <InfoSection app={app} />
          <ActivitySection app={app} />
        </div>
      </div>
    </div>
  );
}
