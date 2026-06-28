import { ApplicationStatusEnum } from '@/types';

export const AUDIT_DOT_COLOR: Record<string, string> = {
  draft: 'bg-gray-400',
  submitted: 'bg-blue-500',
  under_review: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  returned_for_changes: 'bg-red-500',
};

export const STATUS_CONFIG: Record<ApplicationStatusEnum, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  },
  returned_for_changes: {
    label: 'Returned for Changes',
    className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  },
};
