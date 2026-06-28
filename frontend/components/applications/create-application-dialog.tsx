'use client';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useCreateApplicationForm } from '@/hooks/use-create-application-form';
import { Category } from '@/types';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'general', label: 'General Request' },
  { value: 'budget', label: 'Budget Approval' },
  { value: 'leave', label: 'Leave Request' },
  { value: 'procurement', label: 'Procurement' },
  { value: 'other', label: 'Other' },
];

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
  const {
    form,
    creating,
    fieldErrors,
    handleFormChange,
    handleCategoryChange,
    handleCreate,
    resetForm,
  } = useCreateApplicationForm(() => {
    onSuccess();
    onOpenChange(false);
  });

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
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
          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
            />
            {fieldErrors.title && <p className="text-sm text-destructive">{fieldErrors.title}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => handleCategoryChange(v as Category)}
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
            <Label htmlFor="amount">Amount (ZMW)</Label>
            <Input
              id="amount"
              placeholder="Enter amount"
              type="number"
              value={form.amount ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                handleFormChange('amount', value === '' ? undefined : Number(value));
              }}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button disabled={creating} variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button disabled={creating} onClick={handleCreate}>
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {creating ? 'Creating...' : 'Create Application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
