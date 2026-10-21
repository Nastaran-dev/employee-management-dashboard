import type { Department, EmploymentStatus } from './employee';

export interface EmployeeFilters {
  search: string;
  department: Department | 'all';
  status: EmploymentStatus | 'all';
}

export type SortKey = 'name' | 'email' | 'department' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export function toPageSize(value: number): PageSize | undefined {
  return PAGE_SIZE_OPTIONS.find((option) => option === value);
}
