import { useState } from 'react';
import type { SortKey, SortState, EmployeeFilters, PageSize } from '../types/table';

export const DEFAULT_FILTERS: EmployeeFilters = { search: '', department: 'all', status: 'all' };
const DEFAULT_SORT: SortState = { key: 'name', direction: 'asc' };
const DEFAULT_PAGE_SIZE: PageSize = 10;

export function useEmployeeTableState() {
  const [filters, setFilters] = useState<EmployeeFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);

  const hasActiveFilters =
    filters.search.trim() !== '' || filters.department !== 'all' || filters.status !== 'all';

  function updateFilters(patch: Partial<EmployeeFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
    setPage(1);
  }

  function changePageSize(size: PageSize) {
    setPageSize(size);
    setPage(1);
  }

  return {
    filters,
    sort,
    page,
    pageSize,
    hasActiveFilters,
    updateFilters,
    clearFilters,
    toggleSort,
    setPage,
    changePageSize,
  };
}
