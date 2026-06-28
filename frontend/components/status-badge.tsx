'use client';

import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG } from '@/constants';
import { ApplicationStatusEnum } from '@/types';

interface StatusBadgeProps {
  status: ApplicationStatusEnum | 'returned_for_changes';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-50 text-gray-700',
  };
  const Icon = config.icon;
  return (
    <Badge className={config.className}>
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
