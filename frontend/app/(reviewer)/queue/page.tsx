"use client";

import { DataTable } from "@/components/data-table";
import ApplicationsStats from "@/components/applications/stats";
import { useApplications } from "@/hooks/use-applications";
import { Pagination } from "@/components/pagination";
import { StatusFilter } from "@/components/status-filter";
import { getColumns } from "@/app/columns";

/**
 * Renders the applications queue page.
 * @returns The applications queue page.
 */
export default function Page() {
  const {
    allData,
    loading,
    paginated,
    page,
    totalPages,
    status,
    handleStatusChange,
    handlePageChange,
  } = useApplications();

  const columns = getColumns("reviewer");

  return (
    <div className="container mx-auto py-10 space-y-4">
      <ApplicationsStats applications={allData} />

      {/* Filter */}
      <div className="flex items-center justify-between">
        <StatusFilter status={status} onStatusChange={handleStatusChange} />
      </div>

      <DataTable columns={columns} data={paginated} loading={loading} />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
