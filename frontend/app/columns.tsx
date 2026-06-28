'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import Link from 'next/link';

import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Application, ApplicationStatusEnum, Role } from '@/types';
import { formatAmount } from '@/utils/application';
import { getReturnCommentCount, isReturnedForChanges } from '@/utils/application';
import { getInitials } from '@/utils/user';

export const getColumns = (role: Role): ColumnDef<Application>[] => {
  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const title: string = row.getValue('title') ?? '';
        return <span>{title.length > 40 ? title.slice(0, 40) + '…' : title}</span>;
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const desc: string = row.getValue('description') ?? '';
        return <span>{desc.length > 40 ? desc.slice(0, 40) + '…' : desc}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as ApplicationStatusEnum;
        const returned = isReturnedForChanges(row.original);
        const commentCount = returned === true ? getReturnCommentCount(row.original) : 0;

        return returned === true ? (
          <div className="flex items-center gap-1.5">
            <StatusBadge status={status} /> •
            <span className="text-xs text-muted-foreground">
              {commentCount} comment{commentCount !== 1 ? 's' : ''}
            </span>
          </div>
        ) : (
          <StatusBadge status={status} />
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="capitalize">{(row.getValue('category') as string).replace('_', ' ')}</span>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: 'Last Updated',
      cell: ({ row }) => {
        const date = new Date(row.getValue('updated_at'));
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button asChild size="icon" variant="ghost">
          <Link href={`/${role === 'applicant' ? 'applications' : 'queue'}/${row.original.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  if (role === 'reviewer') {
    columns.unshift({
      id: 'applicant',
      header: 'Applicant',
      cell: ({ row }) => {
        const username = row.original.owner?.username ?? '—';
        return (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center text-xs font-medium shrink-0">
              {getInitials(row.original.owner)}
            </div>
            <span className="text-sm">{username}</span>
          </div>
        );
      },
    });
  }

  if (role === 'applicant') {
    columns.splice(2, 0, {
      accessorKey: 'amount',
      header: 'Amount (ZMW)',
      cell: ({ row }) => {
        return <span>{formatAmount(row.getValue('amount'))}</span>;
      },
    });
  }

  return columns;
};
