import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DEPARTMENTS, EMPLOYMENT_STATUSES, isDepartment, isEmploymentStatus } from '../types/employee';
import type { EmployeeFilters } from '../types/table';

interface EmployeeToolbarProps {
  filters: EmployeeFilters;
  hasActiveFilters: boolean;
  disabled: boolean;
  onFiltersChange: (patch: Partial<EmployeeFilters>) => void;
  onClear: () => void;
}

export function EmployeeToolbar({ filters, hasActiveFilters, disabled, onFiltersChange, onClear }: EmployeeToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <label htmlFor="employee-search" className="sr-only">
          Search employees
        </label>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          id="employee-search"
          type="search"
          className="pl-9"
          placeholder="Search by name or email"
          autoComplete="off"
          disabled={disabled}
          value={filters.search}
          onChange={(event) => onFiltersChange({ search: event.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:flex">
        <div>
          <label htmlFor="filter-department" className="sr-only">
            Filter by department
          </label>
          <Select
            id="filter-department"
            wrapperClassName="lg:w-48"
            disabled={disabled}
            value={filters.department}
            onChange={(event) => {
              const value = event.target.value;
              onFiltersChange({ department: isDepartment(value) ? value : 'all' });
            }}
          >
            <option value="all">All departments</option>
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="filter-status" className="sr-only">
            Filter by status
          </label>
          <Select
            id="filter-status"
            wrapperClassName="lg:w-40"
            disabled={disabled}
            value={filters.status}
            onChange={(event) => {
              const value = event.target.value;
              onFiltersChange({ status: isEmploymentStatus(value) ? value : 'all' });
            }}
          >
            <option value="all">All statuses</option>
            {EMPLOYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Button variant="ghost" onClick={onClear} disabled={disabled || !hasActiveFilters}>
        Clear filters
      </Button>
    </div>
  );
}
