"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG } from '@/constants'
import { ApplicationStatusEnum } from "@/types";

interface StatusBadgeProps {
  status: ApplicationStatusEnum;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-50 text-gray-700",
  };
  return <Badge className={config.className}>{config.label}</Badge>;
}
