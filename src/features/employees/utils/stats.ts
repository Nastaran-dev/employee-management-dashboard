import type { Employee } from '../types/employee';

export interface EmployeeStats {
  total: number;
  active: number;
  onLeave: number;
  inactive: number;
}


export function getEmployeeStats(employees: readonly Employee[]): EmployeeStats {
  const stats: EmployeeStats = { total: employees.length, active: 0, onLeave: 0, inactive: 0 };

  for (const { status } of employees) {
    if (status === 'Active') stats.active += 1;
    else if (status === 'On Leave') stats.onLeave += 1;
    else stats.inactive += 1;
  }

  return stats;
}
