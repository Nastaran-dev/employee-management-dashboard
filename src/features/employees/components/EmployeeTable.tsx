import { ArrowDown, ArrowUp, ArrowUpDown, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Employee } from '../types/employee';
import type { SortKey, SortState } from '../types/table';
import { getFullName, getInitials } from '../utils/employee';
import { StatusBadge } from './StatusBadge';

interface Column {
  key: SortKey;
  label: string;
}

const COLUMNS: Column[] = [
  { key: 'name', label: 'Employee' },
  { key: 'email', label: 'Email' },
  { key: 'department', label: 'Department' },
  { key: 'status', label: 'Status' },
];

interface SortHeaderProps {
  column: Column;
  sort: SortState;
  onSort: (key: SortKey) => void;
  sticky?: boolean;
}

function SortHeader({ column, sort, onSort, sticky = false }: SortHeaderProps) {
  const isActive = sort.key === column.key;
  const ariaSort = isActive ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
  const Icon = !isActive ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown;

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={cn('bg-canvas px-4 py-2 text-left text-sm font-medium text-muted', sticky && 'sticky left-0 z-10')}
    >
      <button
        type="button"
        onClick={() => onSort(column.key)}
        className="-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {column.label}
        <Icon aria-hidden="true" className={cn('h-3.5 w-3.5', isActive ? 'text-ink' : 'text-muted/70')} />
      </button>
    </th>
  );
}

interface EmployeeTableProps {
  employees: readonly Employee[];
  sort: SortState;
  onSortChange: (key: SortKey) => void;
  onEdit: (employee: Employee) => void;
}

export function EmployeeTable({ employees, sort, onSortChange, onEdit }: EmployeeTableProps) {
  const cell = 'bg-surface px-4 py-3 text-sm group-hover:bg-canvas/60';

  return (
    <div
      role="region"
      aria-label="Employee table"
      tabIndex={0}
      className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
    >
      <table className="w-full min-w-[720px] border-collapse">
        <caption className="sr-only">Employees</caption>
        <thead className="border-b border-line">
          <tr>
            {COLUMNS.map((column, index) => (
              <SortHeader key={column.key} column={column} sort={sort} onSort={onSortChange} sticky={index === 0} />
            ))}
            <th scope="col" className="bg-canvas px-4 py-2">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {employees.map((employee) => {
            const fullName = getFullName(employee);
            return (
              <tr key={employee.id} className="group">
                <td className={cn(cell, 'sticky left-0 z-10')}>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand"
                    >
                      {getInitials(employee)}
                    </span>
                    <span className="font-medium text-ink">{fullName}</span>
                  </div>
                </td>
                <td className={cn(cell, 'text-muted')}>{employee.email}</td>
                <td className={cell}>{employee.department}</td>
                <td className={cell}>
                  <StatusBadge status={employee.status} />
                </td>
                <td className={cn(cell, 'text-right')}>
                  <Button variant="ghost" size="sm" aria-label={`Edit ${fullName}`} onClick={() => onEdit(employee)}>
                    <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
