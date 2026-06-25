"use client";

import { useEffect, useState } from "react";
import { columns } from "@/app/(applicant)/applications/columns";
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

const STATUSES = [
  { value: "all",          label: "All"          },
  { value: "draft",        label: "Draft"        },
  { value: "submitted",    label: "Submitted"    },
  { value: "under_review", label: "Under Review" },
  { value: "approved",     label: "Approved"     },
  { value: "rejected",     label: "Rejected"     },
];

const PAGE_SIZE = 10;

export default function Page() {
  const [allData, setAllData]     = useState([]);
  const [status, setStatus]       = useState("all");
  const [page, setPage]           = useState(1);

  useEffect(() => {
    fetchApplications().then((data) => {
      setAllData(data);
    }).catch(console.error);
  }, []);

  const filtered = status === "all"
    ? allData
    : allData.filter((a) => a.status === status);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1); }, [status]);

  return (
    <div className="container mx-auto py-10 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Applications</h1>
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
