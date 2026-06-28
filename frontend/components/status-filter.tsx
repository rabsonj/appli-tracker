'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApplicationStatusEnum } from '@/types';

const STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'returned_for_changes', label: 'Returned for Changes' },
];

interface StatusFilterProps {
  status: ApplicationStatusEnum | 'all';
  onStatusChange: (status: ApplicationStatusEnum | 'all') => void;
}

export function StatusFilter({ status, onStatusChange }: StatusFilterProps) {
  return (
    <Select value={status} onValueChange={onStatusChange}>
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
  );
}
