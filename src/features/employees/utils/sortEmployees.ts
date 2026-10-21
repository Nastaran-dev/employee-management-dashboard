import type { Employee, EmploymentStatus } from '../types/employee';
import type { SortKey, SortState } from '../types/table';

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

const STATUS_RANK: Record<EmploymentStatus, number> = {
  Active: 0,
  'On Leave': 1,
  Inactive: 2,
};

function compareByName(a: Employee, b: Employee): number {
  return collator.compare(a.lastName, b.lastName) || collator.compare(a.firstName, b.firstName);
}

function compareBy(key: SortKey, a: Employee, b: Employee): number {
  switch (key) {
    case 'name':
      return compareByName(a, b);
    case 'email':
      return collator.compare(a.email, b.email);
    case 'department':
      return collator.compare(a.department, b.department) || compareByName(a, b);
    case 'status':
      return STATUS_RANK[a.status] - STATUS_RANK[b.status] || compareByName(a, b);
  }
}

export function sortEmployees(employees: readonly Employee[], { key, direction }: SortState): Employee[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...employees].sort((a, b) => factor * compareBy(key, a, b));
}
