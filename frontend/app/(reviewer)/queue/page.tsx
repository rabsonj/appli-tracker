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
import { Application, ApplicationStatusEnum } from "@/types";
import ApplicationsStats from "@/components/applications/stats";

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

  const filtered =
    status === "all" ? allData : allData.filter((a) => a.status === status);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusChange = (value: ApplicationStatusEnum) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="container mx-auto py-10 space-y-4">
      <ApplicationsStats applications={allData} />

      {/* Filter */}
      <div className="flex items-center justify-between">
        <Select
          value={status}
          onValueChange={handleStatusChange}
        >
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
