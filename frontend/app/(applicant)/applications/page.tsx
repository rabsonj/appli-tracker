"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import ApplicationsStats from "@/components/applications/stats";
import { CreateApplicationDialog } from "@/components/applications/create-application-dialog";
import { useApplications } from "@/hooks/use-applications";
import { Pagination } from "@/components/pagination";
import { StatusFilter } from "@/components/status-filter";
import { getColumns } from "@/app/columns";

export default function Page() {
  const [open, setOpen] = useState(false);
  const {
    allData,
    loading,
    paginated,
    page,
    totalPages,
    status,
    handleStatusChange,
    handlePageChange,
    loadApplications,
  } = useApplications();

  const columns = getColumns("applicant");

  return (
    <div className="flex flex-col gap-4">
      <ApplicationsStats applications={allData} />

      <div className="flex items-center justify-between">
        <StatusFilter status={status} onStatusChange={handleStatusChange} />
        <Button onClick={() => setOpen(true)}>Create Application</Button>
      </div>

      <DataTable columns={columns} data={paginated} loading={loading} />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <CreateApplicationDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={loadApplications}
      />
    </div>
  );
}
