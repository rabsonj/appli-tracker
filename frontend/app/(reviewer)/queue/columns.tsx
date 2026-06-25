"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Application, ApplicationStatusEnum } from "@/src/types/api";
import { Eye } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<
  ApplicationStatusEnum,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  },
  submitted: {
    label: "Submitted",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  under_review: {
    label: "Under Review",
    className:
      "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  },
  approved: {
    label: "Approved",
    className:
      "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
  returned_for_changes: {
    label: "Returned for Changes",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
};

/**
 * Returns the initials of a username.
 * @param username - The username.
 * @returns The initials of the username.
 */
function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

/**
 * The columns for the applications queue data table.
 */
export const columns: ColumnDef<Application>[] = [
  {
    id: "applicant",
    header: "Applicant",
    cell: ({ row }) => {
      const username = row.original.owner?.username ?? "—";
      return (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center text-xs font-medium shrink-0">
            {getInitials(username)}
          </div>
          <span className="text-sm">{username}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc: string = row.getValue("description") ?? "";
      return (
        <span className="text-muted-foreground">
          {desc.length > 60 ? desc.slice(0, 60) + "…" : desc}
        </span>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="capitalize">
        {(row.getValue("category") as string).replace("_", " ")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as ApplicationStatusEnum;
      const config = statusConfig[status] ?? {
        label: status,
        className: "bg-gray-50 text-gray-700",
      };
      return <Badge className={config.className}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "updated_at",
    header: "Submitted",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.getValue("updated_at")).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/queue/${row.original.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
];
