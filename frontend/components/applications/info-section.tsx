'use client';

import { StatusBadge } from '@/components/status-badge';
import { Application } from '@/types';
import { isReturnedForChanges } from '@/utils/application';

interface InfoSectionProps {
  app: Application;
}

export function InfoSection({ app }: InfoSectionProps) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">Info</p>
      <dl className="space-y-0 divide-y divide-border">
        {[
          {
            label: 'Status',
            value: (
              <StatusBadge
                status={isReturnedForChanges(app) === true ? 'returned_for_changes' : app.status}
              />
            ),
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
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
