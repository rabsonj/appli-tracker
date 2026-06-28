'use client';

import { StatusBadge } from '@/components/status-badge';
import { Application } from '@/types';

interface InfoSectionProps {
  app: Application;
}

export function InfoSection({ app }: InfoSectionProps) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">Info</p>
      <div className="space-y-0 divide-y divide-border">
        {[
          {
            label: 'Status',
            value: <StatusBadge status={app.status} />,
          },
          { label: 'Owner', value: app.owner.email },
          {
            label: 'Created',
            value: new Date(app.created_at).toLocaleDateString(),
          },
          {
            label: 'Last updated',
            value: new Date(app.updated_at).toLocaleDateString(),
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-2 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
