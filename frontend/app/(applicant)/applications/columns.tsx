"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Application, ApplicationStatusEnum } from "@/src/types/api";
import { Eye, Pencil } from "lucide-react";
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
 * The columns for the applications data table.
 */
export const columns: ColumnDef<Application>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc: string = row.getValue("description") ?? "";
      return <span>{desc.length > 100 ? desc.slice(0, 100) + "…" : desc}</span>;
    },
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
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("category")}</span>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = new Date(row.getValue("updated_at"));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const app = row.original;
      return (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/applications/${app.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {app.status === "draft" && (
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/applications/${app.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      );
    },
  },
];
