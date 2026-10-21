import type { Employee } from '../types/employee';
import type { EmployeeFilters } from '../types/table';

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function filterEmployees(
  employees: readonly Employee[],
  { search, department, status }: EmployeeFilters,
): Employee[] {
  const tokens = normalize(search).split(' ').filter(Boolean);

  return employees.filter((employee) => {
    if (department !== 'all' && employee.department !== department) return false;
    if (status !== 'all' && employee.status !== status) return false;
    if (tokens.length === 0) return true;

    const haystack = normalize(`${employee.firstName} ${employee.lastName} ${employee.email}`);
    return tokens.every((token) => haystack.includes(token));
  });
}
