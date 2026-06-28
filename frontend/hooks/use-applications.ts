'use client';

import { useEffect, useState } from 'react';

import { fetchApplications } from '@/lib/api/applications';
import { Application, ApplicationStatusEnum } from '@/types';
import { isReturnedForChanges } from '@/utils/application';

const PAGE_SIZE = 10;

export function useApplications(initialStatus: ApplicationStatusEnum | 'all' = 'all') {
  const [allData, setAllData] = useState<Application[]>([]);
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadApplications = () => {
    fetchApplications().then(setAllData).catch(console.error);
  };

  useEffect(() => {
    fetchApplications()
      .then(setAllData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    status === 'all'
      ? allData
      : status === 'returned_for_changes'
        ? allData.filter(isReturnedForChanges)
        : allData.filter((a) => a.status === status);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusChange = (value: ApplicationStatusEnum | 'all') => {
    setStatus(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return {
    allData,
    loading,
    paginated,
    page,
    totalPages,
    status,
    handleStatusChange,
    handlePageChange,
    loadApplications,
  };
}
