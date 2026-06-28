'use client';

import { ArrowLeft, FileX } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface ApplicationNotFoundProps {
  backLink: string;
  backLinkText: string;
}

export function ApplicationNotFound({ backLink, backLinkText }: ApplicationNotFoundProps) {
  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <Link
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        href={backLink}
      >
        <ArrowLeft className="h-4 w-4" />
        {backLinkText}
      </Link>

      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileX className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-base font-semibold">Application not found</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          This application may have been deleted or you may not have permission to view it.
        </p>
        <Button asChild className="mt-2" size="sm" variant="outline">
          <Link href={backLink}>{backLinkText}</Link>
        </Button>
      </div>
    </div>
  );
}
