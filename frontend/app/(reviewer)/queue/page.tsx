"use client";

import { useEffect, useState } from "react";
import { columns } from "@/app/(reviewer)/queue/columns";
import { DataTable } from "@/components/data-table";
import { fetchApplications } from "@/lib/api/applications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Application } from "@/src/types/api";

const STATUSES = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "returned_for_changes", label: "Returned for Changes" },
];

const PAGE_SIZE = 10;

/**
 * Renders the applications queue page.
 * @returns The applications queue page.
 */
export default function Page() {
  const [allData, setAllData] = useState<Application[]>([]);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchApplications().then(setAllData).catch(console.error);
  }, []);
  useEffect(() => {
    setPage(1);
  }, [status]);

  const filtered =
    status === "all" ? allData : allData.filter((a) => a.status === status);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submitted = allData.filter((a) => a.status === "submitted").length;
  const underReview = allData.filter(
    (a) => a.status === "under_review"
  ).length;
  const approved = allData.filter((a) => a.status === "approved").length;
  const rejected = allData.filter((a) => a.status === "rejected").length;

  return (
    <div className="container mx-auto py-10 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total", value: allData.length, className: "" },
          {
            label: "Submitted",
            value: submitted,
            className: "text-blue-600",
          },
          {
            label: "Under Review",
            value: underReview,
            className: "text-yellow-600",
          },
          {
            label: "Approved",
            value: approved,
            className: "text-green-600",
          },
          {
            label: "Rejected",
            value: rejected,
            className: "text-red-600",
          },
        ].map(({ label, value, className }) => (
          <div key={label} className="rounded-md bg-muted/50 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-xl font-medium ${className}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={paginated} />

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
