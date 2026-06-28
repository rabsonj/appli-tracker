'use client';

import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        disabled={page === 1}
        size="sm"
        variant="outline"
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        disabled={page === totalPages}
        size="sm"
        variant="outline"
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
