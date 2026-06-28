'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function ApplicationDetailSkeleton() {
  return (
    <div className="container mx-auto py-10 space-y-6 max-w-5xl">
      {/* Back */}
      <Skeleton className="h-4 w-32" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Main */}
        <div className="space-y-5">
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <Skeleton className="h-3 w-16" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Info card */}
          <div className="rounded-lg border bg-card p-5 space-y-3">
            <Skeleton className="h-3 w-8" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-t">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>

          {/* Activity card */}
          <div className="rounded-lg border bg-card p-5 space-y-3">
            <Skeleton className="h-3 w-16" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 py-3 border-t">
                <Skeleton className="mt-1.5 h-2 w-2 rounded-full shrink-0" />
                <div className="space-y-1.5 w-full">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
