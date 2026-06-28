'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { createApplication } from '@/lib/api/applications';
import { ApplicationWritePayload, Category } from '@/types';

const EMPTY_FORM: ApplicationWritePayload = {
  title: '',
  category: 'general',
  description: '',
  amount: undefined,
};

export function useCreateApplicationForm(onSuccess: () => void) {
  const [form, setForm] = useState<ApplicationWritePayload>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFormChange = (
    field: keyof ApplicationWritePayload,
    value: string | number | undefined
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleCategoryChange = (value: Category) => {
    setForm((f) => ({ ...f, category: value }));
  };

  const handleCreate = async () => {
    setCreating(true);
    setFieldErrors({});

    try {
      await createApplication(form);
      toast.success('Application created successfully.');
      setForm(EMPTY_FORM);
      onSuccess();
    } catch (err: unknown) {
      const detail = (err as { response: { data: { detail: string } } })?.response?.data?.detail;

      if (detail && typeof detail === 'object') {
        const errors: Record<string, string> = {};
        for (const [field, messages] of Object.entries(detail)) {
          errors[field] = Array.isArray(messages) ? (messages[0] as string) : String(messages);
        }
        setFieldErrors(errors);
      } else {
        toast.error(detail ?? 'Failed to create application.');
      }
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
  };

  return {
    form,
    creating,
    fieldErrors,
    handleFormChange,
    handleCategoryChange,
    handleCreate,
    resetForm,
  };
}
