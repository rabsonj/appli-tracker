import { Home } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4 text-center">
      <div className="flex items-center justify-center mb-8">
        <div className="h-24 w-24 rounded-full border border-border flex items-center justify-center">
          <div className="h-[68px] w-[68px] rounded-full bg-muted border border-border flex items-center justify-center">
            <span className="text-xl font-medium text-muted-foreground tracking-tight">404</span>
          </div>
        </div>
      </div>

      <h1 className="text-lg font-medium mb-2">Page Not Found</h1>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
        This page doesn&apos;t exist or you don&apos;t have permission to view it. It may have been
        moved or deleted.
      </p>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
